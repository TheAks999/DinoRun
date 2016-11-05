// For Babylon JS examples:
//    http://www.babylonjs-playground.com/

//------------------------------------------------------------------------------
var Scene = function()
{
    var self = this;

    self.m_keys = {left: 0, right: 0, up: 0, down: 0};

    //--------------------------------------------------------------------------
    self.onKeyDown = function(event)
    {
        var key_code = event.keyCode;
        var ch = String.fromCharCode(key_code);
        if (ch == "A")
        {
            self.m_keys.left = 1;
        }
        else if (ch == "D")
        {
            self.m_keys.right = 1;
        }
        else if (ch == "S")
        {
            self.m_keys.down = 1;
        }
        else if (ch == "W")
        {
            self.m_keys.up = 1;
        }
    };

    //--------------------------------------------------------------------------
    self.onKeyUp = function(event)
    {
        var key_code = event.keyCode;
        var ch = String.fromCharCode(key_code);

        if (ch == "A")
        {
            self.m_keys.left = 0;
        }
        else if (ch == "D")
        {
            self.m_keys.right = 0;
        }
        else if (ch == "S")
        {
            self.m_keys.down = 0;
        }
        else if (ch == "W")
        {
            self.m_keys.up = 0;
        }
    };

    //--------------------------------------------------------------------------
    self.animateActor = function()
    {
        if (self.m_keys.up == 1)
        {
            self.m_sphere.position.z += 0.1
        }
        if (self.m_keys.down == 1)
        {
            self.m_sphere.position.z -= 0.1
        }
        if (self.m_keys.left == 1)
        {
            self.m_sphere.position.x -= 0.1
        }
        if (self.m_keys.right == 1)
        {
            self.m_sphere.position.x += 0.1
        }
    };

    //--------------------------------------------------------------------------

    // get the canvas DOM element
    self.m_canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    self.m_engine = new BABYLON.Engine(self.m_canvas, true);

    // create a basic BJS Scene object
    self.m_scene = new BABYLON.Scene(self.m_engine);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    // self.m_camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), self.m_scene);
//    self.m_camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), self.m_scene);
    self.m_camera = new BABYLON.TargetCamera('camera1', new BABYLON.Vector3(0, 5,-10), self.m_scene);

    // target the camera to scene origin
    self.m_camera.setTarget(BABYLON.Vector3.Zero());

    // attach the camera to the canvas
    self.m_camera.attachControl(self.m_canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    self.m_light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), self.m_scene);

    // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
    self.m_sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, self.m_scene);

    // move the sphere upward 1/2 of its height
    self.m_sphere.position.y = 1;

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    self.m_ground = BABYLON.Mesh.CreateGround('ground1', 10, 10, 4, self.m_scene);

    // var surfaces = CreateMap1();
    // for (var key in surfaces)
    // {
    //     var mesh = BABYLON.MeshBuilder.CreatePlane("surface_" + key, {
    //         width: surfaces[key].m_u_max,
    //         height: surfaces[key].m_v_max,
    //         //sideOrientation: BABYLON.Mesh.DOUBLESIDE
    //     },
    //     self.m_scene);
    //     mesh.bakeTransformIntoVertices(surfaces[key].m_to_world_transform);
    // }
    // var surface_position = new SurfacePosition();
    // var world_position = surface_position.GetWorldPosition;
    // self.m_sphere.position = world_position;

    self.m_scene.registerBeforeRender(function(){
        if(self.m_scene.isReady()) {
            self.animateActor();
        }
    });

    // run the render loop
    self.m_engine.runRenderLoop(function(){
        self.m_scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', function() {
        self.m_engine.resize();
    });
    window.addEventListener("keydown", self.onKeyDown, false);
    window.addEventListener("keyup", self.onKeyUp, false);

};

function createScene()
{
    g_scene = Scene();
}

//window.addEventListener('DOMContentLoaded', createScene);
