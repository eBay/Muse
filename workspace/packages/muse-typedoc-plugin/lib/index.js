// import { MarkdownApplication } from 'typedoc-plugin-markdown';
import _ from 'lodash';
import fs from 'fs-extra';
/**
 * Typedoc plugin to generate Muse extension points docs.
 */
export function load(app) {
  // console.log(app);

  app.on('validateProject', (arg) => {
    // console.log('app.on', arg.reflections['63'].toStringHierarchy());
    Object.values(arg.reflections).forEach((value) => {
      console.log(value.toString());
      console.log(value);
    });
  });
}

function genDocExtPoints(reflections) {
  // const docJson = fs.readJsonSync(
  //   '/Users/pwang7/muse/muse-next/ui-plugins/muse-lib-react/doc/ext-points.json',
  // );
  const extRefs = reflections.map((r) => {
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
  const typeByName = _.keyBy(types, 'name');

  const extPoints = [];
  const extNodes = types
    .filter((t) => t.museExt?.name)
    .map((t) => ({
      baseName: t.museExt.name,
      type: t,
    }));

  while (extNodes.length > 0) {
    const extNode = extNodes.shift();
    const extType = extNode.type;

    const children = extType?.children || extType?.declaration?.children || [];
    children.forEach((child) => {
      if (!child.name) return; // skip unnamed children

      if (child.type?.type === 'reflection' && child.type?.declaration?.children?.length > 0) {
        extNodes.push({
          baseName: `${extNode.baseName}.${child.name}`,
          type: child.type,
        });
      } else if (child.type?.type === 'reference' && typeByName[child.type.name]?.museExt) {
        extNodes.push({
          baseName: `${extNode.baseName}.${child.name}`,
          type: typeByName[child.type.name],
        });
      } else {
        extPoints.push({ name: `${extNode.baseName}.${child.name}`, node: child });
      }
    });
  }

  extPoints.sort((a, b) => a.name.localeCompare(b.name));

  const arr = ['## Extension Points'];
  extPoints.forEach((p) => {
    const name = p.name.replace(/#root\./, '');
    let typeName = 'any';
    if (p.node.type?.type === 'reference') {
      typeName = p.node.type.qualifiedName || p.node.type.name;
    } else if (p.node.type?.type === 'reflection') {
      typeName = p.node.type.declaration?.name;
    } else if (p.node.type?.type === 'union') {
      typeName = p.node.type.types.map((t) => t.qualifiedName || t.name).join('');
    }
    arr.push(`### ${name}`);
    arr.push(`> Type: [${typeName}](#${typeName.toLowerCase()})\n`);

    // Description
    arr.push(p.node?.comment?.summary.map((s) => s.text).join('\n'));

    // Example if exist:
    const exampleTag = p.node?.comment?.blockTags?.find((t) => t.tag === 'example');
  });

  console.log(extPoints.map((p) => ({ name: p.name.replace(/#root\./, ''), type: p.type })));

  arr.push('## Interfaces');
  const interfaces = types.filter((t) => t.variant === 'declaration' && t.name !== 'default');

  interfaces.forEach((t) => {
    arr.push(`### ${t.name}`);
    arr.push(`\n> ${t.comment?.shortText || ''}\n`);
    if (t?.children?.length > 0) {
      arr.push('#### Properties');
      t.children.forEach((c) => {
        arr.push(`- **${c.name}** - ${c.comment?.shortText || ''}`);
      });
    }
  });
  // console.log(extPoints.map((p) => p.replace(/#root\./, '')));

  arr.push('## Exports');

  const pluginId = plugin.name.replace('/', '.');
  const fileName = `docs/06 - reusable-plugins/${prefix}${pluginId}.md`;
  fs.writeFileSync(fileName, `# ${plugin.name}\n\n${arr.join('\n')}`);
}

// const plugins = [
//   { name: '@ebay/muse-lib-react' },
//   // '@ebay/muse-boot-default',
//   // '@ebay/muse-init-ebay',
//   // '@ebay/muse-lib-react',
//   // '@ebay/muse-lib-antd',
//   // '@ebay/muse-layout-antd',
// ];

// fs.emptyDirSync('docs/06 - reusable-plugins');
// fs.writeFileSync('docs/06 - reusable-plugins/_category_.yaml', 'label: Reusable Plugins');

// let i = 1;
// for (const plugin of plugins) {
//   await genDocExtPoints({ plugin, prefix: `${_.padStart(i++, 2, '0')} - ` });
// }
