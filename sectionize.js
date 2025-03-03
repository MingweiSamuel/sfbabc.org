import remarkSectionize from 'remark-sectionize';
import { visit } from 'unist-util-visit';

function plugin() {
  return transform;
}

const SUFFIX = ' $HIDE$';

/**
 * @param {import('unist').Node} tree
 */
function transform(tree) {
  const sectionizeTransform = remarkSectionize();
  sectionizeTransform(tree);
  visit(
    tree,
    node => 'heading' === node.type && 'text' === node.children?.[0].type && node.children?.[0].value?.endsWith(SUFFIX),
    detailize
  );
}

/**
 * @param {import('unist').Node} node
 * @param {number} index
 * @param {import('unist').Parent} parent
 */
function detailize(node, index, parent) {
  node.children[0].value = node.children[0].value.slice(0, -SUFFIX.length);

  const rest = parent.children.splice(index + 1, parent.children.length - index - 1);
  const summary = {
    type: 'mdxJsxFlowElement',
    name: 'summary',
    attributes: [],
    children: [node],
  };
  const details = {
    type: 'mdxJsxFlowElement',
    name: 'details',
    attributes: [],
    children: [summary, ...rest],
  }
  parent.children.splice(index, 1, details);
}

export default plugin;
