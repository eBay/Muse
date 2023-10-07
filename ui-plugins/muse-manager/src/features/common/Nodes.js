import { extendArray } from '@ebay/muse-lib-antd/src/utils';

/**
 * A component that renders a list of nodes with ability to extend the list.
 * @param {Array} nodes - The list of nodes to render.
 */
export default function Nodes({ items = [], extName = 'items', extBase, extArgs }) {
  items = items.filter(Boolean);
  extendArray(items, extName, extBase, extArgs);
  const nodes = [];
  items.forEach((n) => {
    let node;
    if (n.render) node = n.render();
    else if (n.node) node = n.node;
    else if (n.component) node = <n.component key={n.key} {...n.props} />;
    nodes.push(node);
  });

  return nodes;
}
