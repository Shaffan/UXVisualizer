// dstructures interface
var dStructures = {
    SLinkedList: function() {
        var list = new List();
        return {
            push: function(value) {
                return list.push(value);
            },
            add: function(value) {
                return list.add(value);
            },
            find: function(position) {
                return list.find(position);
            },
            remove: function(position) {
                return list.remove(position);
            },
            length: function() {
                return list.length;
            }
        };
    },
}

// Linked list implementation
List.prototype.push = function(value) {
    var node = new Node(value);
    var currentNode = this.head;

    node.next = currentNode;
    this.head = node;

    this._length++;

    return node;
};
List.prototype.add = function(value) {
    var node = new Node(value);
    var currentNode = this.head;

    if (!currentNode) {
        this.head = node;
        this._length++;

        return node;
    }

    while (currentNode.next) {
        currentNode = currentNode.next;
    }
    currentNode.next = node;
    this._length++;

    return node;
};
List.prototype.find = function(position) {
    var currentNode = this.head;
    var length = this.length;
    var count = 1;

    if (length === 0 || position < 1 || position > length) {
        throw new Error('Failed: node does not exist in list.');
    }

    while (count < position) {
        currentNode = currentNode.next;
        count++
    }

    return currentNode;
}
List.prototype.remove = function(position) {
    var currentNode = this.head;
    var length = this._length;
    var count = 0;
    var prevNode = null;
    var nodeToDelete = null;
    var deletedNode = null;

    if (position > 0 || position > length) {
        throw new Error('Failed: node does not exist in list');
    }

    if (position === 1) {
        this.head = currentNode.next;
        deletedNode = currentNode;
        currentNode = null;
        this._length--;

        return deletedNode;
    }

    while (count < position) {
        prevNode = currentNode;
        nodeToDelete = currentNode.next;
        count++;
    }

    prevNode.next = nodeToDelete.next;
    deletedNode = nodeToDelete;
    deletedNode = null;
    this._length--;

    return deletedNode;
}
List.prototype.length = function() {
    return this.length;
}

function Node(data) {
    this.data = data;
    this.next = null;
};
function List() {
    this._length = 0;
    this.head = null;
};
