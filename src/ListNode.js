// --- Nó de lista ligada para segmentos da cobra ---

export default class ListNode {
	next = null
	prev = null

	constructor(data) {
		this.data = data
	}

	// Liga este nó ao próximo
	linkTo(node) {
		this.next = node
		node.prev = this
	}
}
