// --- Lista ligada simples para segmentos da cobra ---


export default class LinkedKList {
	constructor(head) {
		this.head = head
		this.end = head
	}

	// Adiciona um novo nó ao fim da lista
	addNode(node) {
		this.end.linkTo(node)
		this.end = node
	}
}
