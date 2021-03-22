const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@menu('Scripts/Core/Map/Editor/MapEditorGrid')
export default class MapEditorGrid extends cc.Component {
    onLoad() {
    }

    //================================================ Public
    initComp() {

    }

    highlight(enable: boolean) {
        this.node.color = enable? cc.Color.RED: cc.Color.GREEN;
    }

    //================================================ Private
}
