// For Babylon JS examples:
//    http://www.babylonjs-playground.com/

g_scene = null;

//------------------------------------------------------------------------------
// The player
var Player = function(index, scene)
{
    var self = this;

    self.m_main = BABYLON.Mesh.CreateCylinder('player_main_' + String(index), 2, 1, 1, 25, 2, scene);
    self.m_main.position.y = 1;

    self.m_box = BABYLON.Mesh.CreateBox("player_box_" + String(index), 0.5, scene);
    self.m_box.position.y = 0.5;
    self.m_box.position.z = 0.5;
    self.m_box.parent = self.m_main;
};

//------------------------------------------------------------------------------
// The scene
var Scene = function()
{
    var self = this;

    self.m_keys = {left: 0, right: 0, up: 0, down: 0};
    self.m_speed = 5;

    //##########################################################################
    // Event handlers

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
    self.animatePlayer = function()
    {
        if (self.m_keys.up == 1)
        {
            //self.m_player.m_main.position.z += 0.1;

            var forward = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(self.m_player.m_main.rotation.y))) / self.m_speed,
                0,   // -0.5,  used as gravity (?)
                parseFloat(Math.cos(parseFloat(self.m_player.m_main.rotation.y))) / self.m_speed);
            self.m_player.m_main.moveWithCollisions(forward);
        }
        if (self.m_keys.down == 1)
        {
            // self.m_player.m_main.position.z -= 0.1

            var backwards = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(self.m_player.m_main.rotation.y))) / self.m_speed,
                0,   // -0.5,  used as gravity (?)
                parseFloat(Math.cos(parseFloat(self.m_player.m_main.rotation.y))) / self.m_speed);
            backwards = backwards.negate();
            self.m_player.m_main.moveWithCollisions(backwards);
        }
        if (self.m_keys.left == 1)
        {
            self.m_player.m_main.position.x -= 0.1
        }
        if (self.m_keys.right == 1)
        {
            self.m_player.m_main.position.x += 0.1
        }
    };

    //##########################################################################
    // Setup the scene

    // get the canvas DOM element
    self.m_canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    self.m_engine = new BABYLON.Engine(self.m_canvas, true);

    // create a basic BJS Scene object
    self.m_scene = new BABYLON.Scene(self.m_engine);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
//    self.m_camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), self.m_scene);
    self.m_camera = new BABYLON.TargetCamera('camera1', new BABYLON.Vector3(0, 5,-10), self.m_scene);
    self.m_camera.setTarget(BABYLON.Vector3.Zero());
    self.m_camera.attachControl(self.m_canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    self.m_light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), self.m_scene);

    self.m_player = new Player(0, self.m_scene);

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    self.m_ground = BABYLON.Mesh.CreateGround('ground1', 10, 10, 4, self.m_scene);

    self.m_scene.registerBeforeRender(function(){
        if(self.m_scene.isReady()) {
            self.animatePlayer();
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

//##############################################################################

//------------------------------------------------------------------------------
function createScene()
{
    g_scene = Scene();
}

//window.addEventListener('DOMContentLoaded', createScene);
