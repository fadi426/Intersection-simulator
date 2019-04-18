import * as THREE from 'three';
import { TrafficLight } from '../trafficLight/traffic-light';
import { Vector3 } from 'three';

export class Cycle {
    private _mesh : any;
    private _cycle1Path = [new THREE.Vector3(5.0, 0.49, 0.001), new THREE.Vector3(-2.0, 0.49, 0.001)];
    private _cycle2Path = [new THREE.Vector3(0.49, -5.0, 0.001), new THREE.Vector3(0.49, 2.0, 0.001)];
    private _cycle3Path = [new THREE.Vector3(-5.0, -0.63, 0.001), new THREE.Vector3(2.0, -0.63, 0.001)];
    private _cycle4Path = [new THREE.Vector3(-0.49, 5.0, 0.001), new THREE.Vector3(-0.49, -2.0, 0.001)];
    private _paths = [this._cycle1Path, this._cycle2Path, this._cycle3Path, this._cycle4Path];
    private _path : Vector3[];
    private _speed = 0;
    private _maxSpeed = 0.003;
    private _respawnDistance = 0.02;
    private _currentPoint : Vector3;
    private _nextPoint : Vector3;
    private _pathNumber : number;
    private _reachedEnd : boolean;
    private _currentPosition : Vector3;
    private _currentNode = 1;

    constructor(Name : Number){
        this._pathNumber = Math.floor(Math.random() * this._paths.length);
        this._path = this._paths[this._pathNumber]
        this._currentPoint = this._path[0];
        this._nextPoint = this._path[1];
        let geometry = new THREE.BoxGeometry(0.07, 0.015, 0.05);
        let material = new THREE.MeshBasicMaterial({ color: '#'+(Math.random()*0xFFFFFF<<0).toString(16) });
        this._mesh = new THREE.Mesh(geometry, material);
        this._mesh.name = Name;
        this._mesh.position.set(this._path[0].x, this._path[0].y, this._path[0].z);
        this._currentPosition = this._path[0];
        if(this._path[0].y != this._path[1].y){
            this._mesh.rotateZ(1.58);
        }
    }

    public move(trafficLightArr : TrafficLight[], cycleArr: Cycle[]){
        if(this._mesh.position.distanceTo(this._path[this._path.length - 1]) < this._respawnDistance){
            this._reachedEnd = true;
        }

        if(this._mesh.position.distanceTo(this._path[this._currentNode]) < this._respawnDistance && this._currentNode < this._path.length - 1){
            this._currentNode++;
            this._currentPoint.copy(this._paths[this._pathNumber][this._currentNode - 1]);
            this._nextPoint.copy(this._paths[this._pathNumber][this._currentNode]);
        }

        let cycleFront = new THREE.Vector3().copy(this._mesh.position);
        let distanceCycle = this._nextPoint.distanceTo(this._mesh.position);
        let frontDistance = 0.09 / distanceCycle;
        let nextPointCycle = new THREE.Vector3().copy(this._nextPoint)
        let directionCycle = nextPointCycle.sub(this._currentPoint);
        cycleFront.x += directionCycle.x * frontDistance;
        cycleFront.y += directionCycle.y * frontDistance;

        let move = true;
        let distanceToLight = cycleFront.distanceTo(trafficLightArr[this._pathNumber + 14].getMesh.position);
        if(!(distanceToLight > 0.02 || trafficLightArr[this._pathNumber + 14].getMode == 2)){
            move = false;
        }
        
        cycleArr.forEach(cycle => {
            let cycleDistance = cycleFront.distanceTo(cycle._mesh.position);
            if(cycleDistance < 0.06){
                move = false;
            }
        });

        if(move){
            if(this._speed > this._maxSpeed){
                this._speed = this._maxSpeed;
            }
            else{
                this._speed += 0.00004;
            }
        }
        else{
            if(this._speed < 0.0001){
                this._speed = 0;
            }
            else{
                this._speed -= 0.0010;
            }
        }

        let differncePoints = new THREE.Vector3().copy(this._nextPoint);
        differncePoints.sub(this._currentPoint);
        let rotation = Math.atan(differncePoints.y / differncePoints.x);
        this._mesh.rotation.z = rotation;

        let distance = this._nextPoint.distanceTo(this._currentPoint);
        let speed = this._speed / distance;
        let nextPoint = new THREE.Vector3().copy(this._nextPoint)
        let direction = nextPoint.sub(this._currentPoint);
        this._currentPosition.x += direction.x * speed;
        this._currentPosition.y += direction.y * speed;
        this._mesh.position.set(this._currentPosition.x, this._currentPosition.y, this._currentPosition.z);
    }

    public get getMesh(){
        return this._mesh;
    }

    public get getPath(){
        return this._path;
    }

    public get getReachedEnd(){
        return this._reachedEnd;
    }
}