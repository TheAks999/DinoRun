// For Babylon JS examples:
//    http://www.babylonjs-playground.com/

keys={left: 0, right: 0, up: 0, down: 0};

function animateActor()
{
    if (keys.up == 1)
    {
        sphere.position.z += 0.1
    }
    if (keys.down == 1)
    {
        sphere.position.z -= 0.1
    }
    if (keys.left == 1)
    {
        sphere.position.x -= 0.1
    }
    if (keys.right == 1)
    {
        sphere.position.x += 0.1
    }
}

function createScene()
{
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    // createScene function that creates and return the scene
    var createScene = function(){
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
//                var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);
        var camera = new BABYLON.TargetCamera('camera1', new BABYLON.Vector3(0, 5,-10), scene);

        // target the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        camera.attachControl(canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

        // move the sphere upward 1/2 of its height
        sphere.position.y = 1;

        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround('ground1', 10, 10, 4, scene);

        window.addEventListener("keydown", function (evt) {
            // draw SSAO with scene when pressed "1"
            if (evt.keyCode === 49) {
                sphere.position.x -= 0.1;
                sphere.position.z -= 0.1;
            }
            // draw only SSAO when pressed "2"
            else if (evt.keyCode === 50) {
                sphere.position.x += 0.1;
                sphere.position.z += 0.1;
            }
        });


        // return the created scene
        return scene;
    };

    // call the createScene function
    g_scene = createScene();

    g_scene.registerBeforeRender(function(){
        if(g_scene.isReady()) {
            animateActor();
        }
    });

    // run the render loop
    engine.runRenderLoop(function(){
        g_scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function() {
        engine.resize();
    });
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
}

function onKeyDown(event)
{
    var key_code = event.keyCode;
    var ch = String.fromCharCode(key_code);
    if (ch == "A")
    {
        keys.left = 1;
    }
    else if (ch == "D")
    {
        keys.right = 1;
    }
    else if (ch == "S")
    {
        keys.down = 1;
    }
    else if (ch == "W")
    {
        keys.up = 1;
    }
}

function onKeyUp(event)
{
    var key_code = event.keyCode;
    var ch = String.fromCharCode(key_code);

    if (ch == "A")
    {
        keys.left = 0;
    }
    else if (ch == "D")
    {
        keys.right = 0;
    }
    else if (ch == "S")
    {
        keys.down = 0;
    }
    else if (ch == "W")
    {
        keys.up = 0;
    }
}

//window.addEventListener('DOMContentLoaded', createScene);
