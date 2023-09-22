import { extendArray } from '@ebay/muse-lib-antd/src/utils';

/**
 * A component that renders a list of nodes with ability to extend the list.
 * @param {Array} nodes - The list of nodes to render.
 */
export default function Nodes({ nodes, extName, baseExt }) {
  extendArray(nodes, 'nodes', extName, baseExt);
  return nodes.map((n) => (n.render ? n.render() : n.node)).filter(Boolean);
}
