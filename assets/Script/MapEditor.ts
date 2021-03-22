import MathUtils from "./MathUtils";
import MapEditorGrid from "./MapEditorGrid";
import { MapTerrain } from "./MapTerrain";

const {ccclass, property, menu, executeInEditMode} = cc._decorator;

@ccclass
@menu('Scripts/MapEditor/MapEditor')
export default class MapEditor extends cc.Component {
    @property(cc.Node) nodeGridView: cc.Node = null;
    @property(cc.Node) nodeColliderContainer: cc.Node = null;
    @property(cc.Integer) gridSize: number = 20;
    
    nodeDebug: cc.Node = null;
    nodeEditorGrids: MapEditorGrid[][] = [[]];
    posTris: cc.Vec2[][] = [[]];

    onLoad() {
        this.nodeDebug = new cc.Node();
        this.nodeDebug.parent = this.node;

        this.loadCells();

        CC_PREVIEW && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onEventKeyDown, this);
    }

    //================================================ Events
    onEventKeyDown(event) {
        switch(event.keyCode) {
            case 'V'.charCodeAt(0):
                this.genTerrain();
                break;
            case 'D'.charCodeAt(0):
                this.loadTerrain();
                break;
        }
    }

    //================================================ Private
    private loadCells() {
        this.nodeDebug.destroyAllChildren();
        this.nodeEditorGrids = [[]];
        var GridSize = this.gridSize;

        var row = Math.ceil(this.node.height / GridSize);
        var col = Math.ceil(this.node.width / GridSize);
        for (var i = 0; i < row; i++) {
            this.nodeEditorGrids[i] = [];
            for (var j = 0; j < col; j++) {
                var node = cc.instantiate(this.nodeGridView) as cc.Node;
                node.parent = this.nodeDebug;
                node.setContentSize(cc.size(GridSize * 0.8, GridSize * 0.8));
                node.position = cc.v2(j * GridSize + GridSize / 2, i * GridSize + GridSize / 2);

                this.nodeEditorGrids[i].push(node.addComponent(MapEditorGrid));
            }
        }
    }

    private genTerrain() {
        this.posTris = [];
        
        this.nodeColliderContainer.children.forEach(ele => {
            this.posTris = this.posTris.concat(MathUtils.points2tris(ele.getComponent(cc.PolygonCollider).points));
        });

        var output = [];
        for (var i = 0; i < this.nodeEditorGrids.length; i++) {
            var rowGrids = this.nodeEditorGrids[i];
            for (var j = 0; j < rowGrids.length; j++) {
                var grid = rowGrids[j];
                var point = grid.node.getPosition();
                
                var contains = MathUtils.trisContainsPoint(this.posTris, point);
                grid.highlight(contains);
                output.push(contains? 0 : 1);
            }
        }
        console.log('=====develop=====', JSON.stringify(output));
    }

    private loadTerrain() {
        var terrainData = MapTerrain;

        for (var i = 0; i < terrainData.length; i++) {
            var rowGrids = terrainData[i];
            for (var j = 0; j < rowGrids.length; j++) {
                var enabled = rowGrids[j];
                this.nodeEditorGrids[i][j].highlight(!enabled);
            }
        }
    }
}