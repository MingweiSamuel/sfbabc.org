import { visit } from 'unist-util-visit';

function plugin() {
  return transform;
}

/**
 * @param {import('unist').Node} tree
 */
function transform(tree) {
  visit(
    tree,
    filter,
    liftCaptions
  );
}

/**
 * @param {import('unist').Node} node
 */
function filter(node) {
  if ('mdxJsxFlowElement' !== node.type) return false;
  if ('div' !== node.name) return false;
  if (!Array.isArray(node.attributes)) return false;
  const classAttr = node.attributes.find(attr => 'mdxJsxAttribute' === attr.type && 'class' === attr.name);
  if (null == classAttr || "string" !== typeof classAttr.value) return false;
  const classList = classAttr.value.split(' ');
  return classList.includes('caption') && classList.includes('right');
}


/**
 * @param {import('unist').Node} node
 * @param {number} index
 * @param {import('unist').Parent} parent
 */
function liftCaptions(node, index, parent) {
  const prev = parent.children[index - 1];
  if (null == prev) return;
  if ('heading' !== prev.type) return;

  // Swap `node` to be before `prev`.
  parent.children[index] = prev;
  parent.children[index - 1] = node;
}

export default plugin;
