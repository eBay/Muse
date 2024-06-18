import _ from 'lodash';
import fs from 'fs-extra';
import { ReflectionKind } from 'typedoc';
import ts from 'typescript';

let sourceByName = {};
function getCode(reflection) {
  // A simple mechanism to get source code of a type definition
  // Maybe there're some edge cases that this doesn't work
  if (!sourceByName[reflection.name]) {
    if (reflection.sources[0].fullFileName) {
      const source = fs.readFileSync(reflection.sources[0].fullFileName, 'utf8');
      const node = ts.createSourceFile('name.ts', source, ts.ScriptTarget.Latest);
      node.forEachChild((child) => {
        sourceByName[child.name?.escapedText] = source
          .substring(child.pos, child.end)
          .replace(/^[\n\r ]+/, '')
          .split('\n')
          .map((l) => l.replace(/^export /, ''))
          .join('\n');
      });
    }
  }

  return sourceByName[reflection.name];
}

/**
 * Typedoc plugin to generate Muse extension points docs.
 */
export function load(app) {
  app.on('validateProject', (arg) => {
    // This event works, but some better event to use?
    genDocExtPoints(arg.reflections);
  });
}

function genDocExtPoints(reflections) {
  // const docJson = fs.readJsonSync(
  //   '/Users/pwang7/muse/muse-next/ui-plugins/muse-lib-react/doc/ext-points.json',
  // );
  const extRefs = Object.values(reflections).map((r) => {
    const extTag = r?.comment?.blockTags?.find((t) => t.tag === '@museExt');
    return {
      ...r,
      museExt: extTag
        ? {
            name: extTag?.content?.[0]?.text,
          }
        : false,
    };
  });
  const refById = _.keyBy(extRefs, 'id');

  const extPoints = [];
  const extNodes = extRefs
    .filter((r) => r.museExt?.name)
    .map((r) => ({
      baseName: r.museExt.name,
      reflection: r,
    }));

  while (extNodes.length > 0) {
    const extNode = extNodes.shift();
    const children = extNode.reflection?.children || [];
    children.forEach((child) => {
      if (!child.name) return; // skip unnamed children

      const targetRef = child.type?._target ? refById[child.type._target] : null;
      if (child.type?.type === 'reflection' && child.type?.declaration?.children?.length > 0) {
        extNodes.push({
          baseName: `${extNode.baseName}.${child.name}`,
          reflection: child.type.declaration,
        });
      } else if (targetRef?.museExt) {
        extNodes.push({
          baseName: `${extNode.baseName}.${child.name}`,
          reflection: targetRef.type?.declaration || targetRef,
        });
      } else {
        extPoints.push({ name: `${extNode.baseName}.${child.name}`, reflection: child });
      }
    });
  }

  extPoints.sort((a, b) => a.name.localeCompare(b.name));

  const pkgJson = fs.readJsonSync('./package.json');

  const interfaces = Object.values(reflections).filter(
    (t) =>
      [ReflectionKind.Interface, ReflectionKind.TypeAlias].includes(t.kind) && t.name !== 'default',
  );

  const arr = [];
  arr.push(`# ${pkgJson.name}`);
  arr.push('## Extension Points');
  console.log('Generating extension points...');
  extPoints.forEach((p) => {
    const name = p.name.replace(/#root\./, '');
    arr.push(`### ${name}`);

    let typeSignature = '';
    if (p.reflection.type?.declaration?.signatures?.length > 0) {
      const s = p.reflection.type?.declaration.signatures[0];
      const params = s.parameters.map((p) => p.toString().replace('Parameter ', '')).join(', ');
      typeSignature = `*(${params}) => ${s.toString().replace('CallSignature __type: ', '')}*`;
    } else {
      typeSignature =
        '*' +
        p.reflection
          .toString()
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/.+: /, '') +
        '*';
    }

    // Add links to interfaces or types
    interfaces.forEach((i) => {
      if (typeSignature.includes(i.name)) {
        typeSignature = typeSignature.replace(
          new RegExp('\\b' + i.name + '\\b', 'ig'),
          `[${i.name}](#${i.name.toLowerCase()})`,
        );
      }
    });

    arr.push(typeSignature);
    arr.push('');

    // Description
    const descTag = p.reflection?.comment?.blockTags?.find((t) => t.tag === '@description');

    const summary = p.reflection?.comment?.summary?.map((s) => s.text).join('\n');
    const desc = descTag?.content?.map((c) => c.text).join('\n') || summary;
    if (desc) {
      arr.push(desc);
      arr.push('');
    }

    // Example if exist:
    const exampleTag = p.reflection?.comment?.blockTags?.find((t) => t.tag === '@example');
    if (exampleTag) {
      arr.push('#### Example');
      arr.push(exampleTag.content.map((c) => c.text).join('\n'));
      arr.push('');
    }
  });

  console.log('Geneating interfaces and types...');
  arr.push('## Interfaces & Types');
  interfaces.sort((a, b) => a.name.localeCompare(b.name));

  interfaces.forEach((t) => {
    arr.push(`### ${t.name}`);
    arr.push('```ts');
    arr.push(getCode(t));
    arr.push('```');
  });

  fs.writeFileSync('./MUSE.md', arr.join('\n'));
}
