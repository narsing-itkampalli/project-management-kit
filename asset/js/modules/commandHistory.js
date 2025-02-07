const commandHistory = {
    undo: [],
    redo: [],
    clearRedo: () => {
        commandHistory.redo.splice(0, commandHistory.redo.length);
    }
};

(()=>{
    window.addEventListener('keyup', keyupHandler);

    function keyupHandler(event) {
        if(!event.ctrlKey) return void 0;
        if(event.key === 'z') return undo();
        if(event.key === 'y') return redo();
    }

    function undo() {
        if(!commandHistory.undo.length) return void 0;
        const lastUndoCommand = commandHistory.undo.pop();
        lastUndoCommand.undo();
        commandHistory.redo.push(lastUndoCommand);
    }

    function redo() {
        if(!commandHistory.redo.length) return void 0;
        const lastRedoCommand = commandHistory.redo.pop();
        lastRedoCommand.redo();
        commandHistory.undo.push(lastRedoCommand);
    }
})();

export default commandHistory;