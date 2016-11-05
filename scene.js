// For Babylon JS examples:
//    http://www.babylonjs-playground.com/

// Example Babylon JS:
//    http://www.babylon.actifgames.com/moveCharacter/

// Debugging can be done by:  console.log(obj);

// Forward is +z.  Up is +y.

var g_scene;

g_rotation_matrices = {
    left: BABYLON.Matrix.RotationY(-Math.PI / 2),
    right: BABYLON.Matrix.RotationY(Math.PI / 2),
    backwards: BABYLON.Matrix.RotationY(-Math.PI)
};


//------------------------------------------------------------------------------
// The player
var Player = function(index, mesh, scene)
{
    var self = this;

    self.m_camera_y_offset = 1.5;

    self.m_main = new BABYLON.Mesh("player_" + index, scene);
    self.m_main.checkCollisions = true;
    self.m_main.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
    self.m_main.ellipsoidOffset = new BABYLON.Vector3(0, 1.0, 0);

    self.m_ellipsoid = BABYLON.MeshBuilder.CreateSphere("player_box_" + String(index),
        {
            diameterX:self.m_main.ellipsoid.x*2,
            diameterY:self.m_main.ellipsoid.y*2,
            diameterZ:self.m_main.ellipsoid.z*2
        }, scene);
    self.m_ellipsoid.parent = self.m_main;
    self.m_ellipsoid.position = self.m_main.ellipsoidOffset;
    self.m_ellipsoid_material = new BABYLON.StandardMaterial(
        "player_ellipsoid", scene);
    self.m_ellipsoid_material.alpha = 0.5;
    self.m_ellipsoid_material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
    self.m_ellipsoid.material = self.m_ellipsoid_material;

    self.m_man = mesh;
    // self.m_man.position.y = 1.38;
    self.m_man.bakeTransformIntoVertices(g_rotation_matrices.right);
    self.m_man.parent = self.m_main;

    // // static CreateCylinder(name, height, diameterTop, diameterBottom, tessellation, subdivisions, scene, updatable, sideOrientation);
    // self.m_cylinder = BABYLON.Mesh.CreateCylinder('player_main_' + String(index), 2, 0.5, 1, 25, 2, scene);
    // self.m_cylinder.position.y = 1;
    // self.m_cylinder.parent = self.m_main;
    //
    // self.m_box = BABYLON.Mesh.CreateBox("player_box_" + String(index), 0.5, scene);
    // self.m_box.position.y = 1.5;
    // self.m_box.position.z = 0.5;
    // self.m_box.scaling.x = 2.0;
    // self.m_box.parent = self.m_main;
};

//------------------------------------------------------------------------------
// The scene
var Scene = function()
{
    var self = this;

    self.m_keys = {left: 0, right: 0, up: 0, down: 0};
    self.m_speed = 1/5.0;

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
        var direction = new BABYLON.Vector3(Math.sin(self.m_player.m_main.rotation.y),
            0,   // -0.5,  used as gravity (?)
            Math.cos(self.m_player.m_main.rotation.y));

        var forward = direction.scale(self.m_speed);
        var net = BABYLON.Vector3.Zero();

        if (self.m_keys.up == 1)
        {
            net.addInPlace(forward);
        }
        if (self.m_keys.down == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(forward, g_rotation_matrices.backwards));
        }
        if (self.m_keys.left == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(forward, g_rotation_matrices.left));
        }
        if (self.m_keys.right == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(forward, g_rotation_matrices.right));
        }
        self.m_player.m_main.moveWithCollisions(net);
        self.cameraFollowPlayer();
    };

    //--------------------------------------------------------------------------
    self.cameraFollowPlayer = function()
    {
        self.m_player.m_main.rotation.y = -self.m_camera.alpha - Math.PI / 2;
        self.m_camera.target = self.m_player.m_main.position.clone();
        self.m_camera.target.y += self.m_player.m_camera_y_offset;
    };

    //##########################################################################
    // Setup the scene

    // get the canvas DOM element
    self.m_canvas = document.getElementById('renderCanvas');

    // load the 3D engine
    self.m_engine = new BABYLON.Engine(self.m_canvas, true);

    // create a basic BJS Scene object
    self.m_scene = new BABYLON.Scene(self.m_engine);
    self.m_scene.collisionsEnabled = true;

    self.m_room_mesh_a = new BABYLON.Mesh("room_a", self.m_scene);

    // load room
    BABYLON.SceneLoader.ImportMesh(
        "", "assets/levels/double_pathway/", "double_pathway.babylon",
        self.m_scene, function (newMeshes, particleSystems, skeletons)
    {
        for (var key in newMeshes)
        {
            newMeshes[key].parent = self.m_room_mesh_a;
            for (var key_2 in self.m_scene.meshes)
            {
                if (self.m_scene.meshes[key_2].sourceMesh == newMeshes[key])
                {
                    self.m_scene.meshes[key_2].parent = self.m_room_mesh_a;
                }
            }
        }
        for (key in particleSystems)
        {
            particleSystems[key].parent = self.m_room_mesh_a;
        }
        for (key in skeletons)
        {
            skeletons[key].parent = self.m_room_mesh_a;
        }

        for (key in self.m_scene.meshes)
        {
            if (self.m_scene.meshes[key].name.substr(0, 3) == "Tr_")
            {
                self.m_scene.meshes[key].checkCollisions = true;
            }
        }

        // Create second room.
        self.m_room_mesh_b = self.m_room_mesh_a.clone("room_b");
        self.m_room_mesh_b.position.x -= 21;
        self.m_room_mesh_b.rotation.y = -Math.PI / 2;
        self.m_room_mesh_b.rotation.x = -Math.PI;
    });

    BABYLON.SceneLoader.ImportMesh(
        "", "assets/characters/man/", "man.babylon",
        self.m_scene, function (newMeshes, particleSystems, skeletons)
    {
        newMeshes[0].visibility = false;
        self.m_man = newMeshes[1];

        self.m_player = new Player(0, self.m_man, self.m_scene);
        self.m_player.m_main.position.y = -4;
    });

    self.m_camera = new BABYLON.ArcRotateCamera(
        'camera1', -Math.PI / 2, Math.PI / 2, 6,
        new BABYLON.Vector3.Zero(), self.m_scene);
    self.m_scene.activeCamera = self.m_camera;
    self.m_camera.attachControl(self.m_canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    self.m_light = new BABYLON.HemisphericLight(
        'light1', new BABYLON.Vector3(0,1,0), self.m_scene);

    self.m_scene.debugLayer.show();

    self.m_scene.registerBeforeRender(function(){
        if (self.m_scene.isReady()) {
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
