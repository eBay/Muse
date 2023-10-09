import { extendArray } from './utils';

/**
 * A component that renders a list of nodes with ability to extend the list.
 * @param {Array} items - The list of nodes to render.
 */
export default function Nodes({ items = [], extName = 'items', extBase, extArgs }) {
  extendArray(items, extName, extBase, extArgs);
  const nodes = [];
  items.filter(Boolean).forEach(n => {
    let node;
    if (n.render) node = n.render();
    else if (n.content) node = n.content;
    else if (n.component) node = <n.component key={n.key} {...n.props} />;
    nodes.push(node);
  });

  return nodes;
}
