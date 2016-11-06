// For Babylon JS examples:
//    http://www.babylonjs-playground.com/

// Example Babylon JS:
//    http://www.babylon.actifgames.com/moveCharacter/

// Debugging can be done by:  console.log(obj);

// Forward is +z.  Up is +y. Coordinate system is left handed.

var g_scene;

var g_rotation_matrices = {
    left: BABYLON.Matrix.RotationY(-Math.PI / 2),
    right: BABYLON.Matrix.RotationY(Math.PI / 2),
    backwards: BABYLON.Matrix.RotationY(-Math.PI)
};

var g_game_options = {
    debug_scene_mode: true,
    debug_show_player_ellipsoid: true,
    normal_speed: 1/5.0,
    fast_speed: 1/5.0 * 2
};

//------------------------------------------------------------------------------
// The player
var Player = function (scene)
{
    var self = this;

    self.m_camera_y_offset = 1.5;

    self.m_name="player";
    self.m_root_mesh = new BABYLON.Mesh("player", scene);
    self.m_child_meshes = [];

    self.m_root_mesh.checkCollisions = true;
    self.m_root_mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
    self.m_root_mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1.0, 0);

    if (g_game_options.debug_show_player_ellipsoid)
    {
        self.m_ellipsoid = BABYLON.MeshBuilder.CreateSphere(
            "player_ellipsoid",
            {
                diameterX:self.m_root_mesh.ellipsoid.x*2,
                diameterY:self.m_root_mesh.ellipsoid.y*2,
                diameterZ:self.m_root_mesh.ellipsoid.z*2
            }, scene);
        self.m_ellipsoid.parent = self.m_root_mesh;
        self.m_ellipsoid.position = self.m_root_mesh.ellipsoidOffset;
        self.m_ellipsoid_material = new BABYLON.StandardMaterial(
            "player_ellipsoid_material", scene);
        self.m_ellipsoid_material.alpha = 0.5;
        self.m_ellipsoid_material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
        self.m_ellipsoid.material = self.m_ellipsoid_material;
    }

    // // static CreateCylinder(
    // //    name, height, diameterTop, diameterBottom,
    // //    tessellation, subdivisions, scene, updatable, sideOrientation);
    // self.m_cylinder = BABYLON.Mesh.CreateCylinder(
    //    "player_cylinder", 2, 0.5, 1, 25, 2, scene);
    // self.m_cylinder.position.y = 1;
    // self.m_cylinder.parent = self.m_root_mesh;
    //
    // self.m_box = BABYLON.Mesh.CreateBox(
    //    "player_box", 0.5, scene);
    // self.m_box.position.y = 1.5;
    // self.m_box.position.z = 0.5;
    // self.m_box.scaling.x = 2.0;
    // self.m_box.parent = self.m_root_mesh;

    //--------------------------------------------------------------------------
    self.scheduleLoad = function(asserts_manager, root_url, scene_file_name)
    {
        var task = asserts_manager.addMeshTask(
            self.m_name + "_task", "", root_url,
            scene_file_name);
        task.onSuccess = function (task)
        {
            self.handleMeshLoadSuccess(
                task.loadedMeshes,
                task.loadedParticleSystems,
                task.loadedSkeletons);
        };
        task.onError = function (task)
        {
            alert(self.m_name + " failed to load.")
        };
    };

    //--------------------------------------------------------------------------
    self.handleMeshLoadSuccess = function(
        new_meshes, particle_systems, skeletons)
    {
        for (var key in new_meshes)
        {
            var new_mesh = new_meshes[key];
            new_mesh.parent = self.m_root_mesh;
            self.m_child_meshes.push(new_mesh);
        }
        if (1 != self.m_child_meshes.length)
        {
            throw "Too many child meshes for player."
                + "Got " + self.m_child_meshes.length
                + ", expected 1.";
        }
        self.m_man = self.m_child_meshes[0];
        // self.m_man.position.y = 1.38;
        //self.m_man.bakeTransformIntoVertices(g_rotation_matrices.right);
        self.m_man.parent = self.m_root_mesh;

    };

};

//------------------------------------------------------------------------------
var Room = function (name, scene)
{
    var self = this;
    self.m_name = name;
    self.m_scene = scene;
    self.m_root_mesh = new BABYLON.Mesh(name, self.m_scene);
    self.m_child_meshes = [];
    self.m_trough_meshes = [];
    self.m_gravity_meshes = [];

    //--------------------------------------------------------------------------
    self.scheduleLoad = function(asserts_manager, root_url, scene_file_name)
    {
        var task = asserts_manager.addMeshTask(
            self.m_name + "_task", "", root_url,
            scene_file_name);
        task.onSuccess = function (task)
        {
            self.handleMeshLoadSuccess(
                task.loadedMeshes,
                task.loadedParticleSystems,
                task.loadedSkeletons);
        };
        task.onError = function (task)
        {
            alert(self.m_name + " failed to load.")
        };
    };

    //--------------------------------------------------------------------------
    self.handleMeshLoadSuccess = function (
        new_meshes, particle_systems, skeletons)
    {
        // link the members to the root mesh
        for (var key in new_meshes)
        {
            var new_mesh = new_meshes[key];
            new_mesh.parent = self.m_root_mesh;
            self.m_child_meshes.push(new_mesh);
            for (var key_2 in self.m_scene.meshes)
            {
                var scene_mesh = self.m_scene.meshes[key_2];
                if (scene_mesh.sourceMesh == new_mesh)
                {
                    scene_mesh.parent = self.m_root_mesh;
                    self.m_child_meshes.push(scene_mesh);
                }
            }
        }
        for (key in particle_systems)
        {
            particle_systems[key].parent = self.m_root_mesh;
        }
        for (key in skeletons)
        {
            skeletons[key].parent = self.m_root_mesh;
        }

        // turn on collisions for troughs
        for (key in self.m_child_meshes)
        {
            var mesh = self.m_child_meshes[key];
            if (mesh.name.substr(0, 3) == "Tr_")
            {
                mesh.checkCollisions = true;
                self.m_trough_meshes.push(mesh);
            }
        }
        if (mesh.name.substr(0, 5) == "Grav_")
        {
            self.m_gravity_meshes.push(mesh);
        }
    };

    //--------------------------------------------------------------------------
    self.clone = function(name)
    {
        var new_room = new Room(name, self.m_scene);
        for (key in self.m_child_meshes)
        {
            var mesh = self.m_child_meshes[key];
            var new_mesh = mesh.clone(name + "." + mesh.name);
            new_mesh.parent = new_room.m_root_mesh;
            new_room.m_child_meshes.push(new_mesh);
        }
        return new_room;
    }
};

//------------------------------------------------------------------------------
// The scene
var Scene = function()
{
    var self = this;

    self.m_keys = {left: 0, right: 0, up: 0, down: 0};
    self.m_speed = g_game_options.normal_speed;

    //##########################################################################
    // Event handlers

    //--------------------------------------------------------------------------
    self.onKeyDown = function(event)
    {
        var key_code = event.keyCode;
        var ch = String.fromCharCode(key_code);

        if (key_code == 16)
        {
            self.m_speed = g_game_options.fast_speed;
        }
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

        if (key_code == 16)
        {
            self.m_speed = g_game_options.normal_speed;
        }
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
        var direction = new BABYLON.Vector3(
            Math.sin(self.m_player.m_root_mesh.rotation.y),
            0,
            Math.cos(self.m_player.m_root_mesh.rotation.y));

        var forward = direction.scale(self.m_speed);
        var net = BABYLON.Vector3.Zero();

        if (self.m_keys.up == 1)
        {
            net.addInPlace(forward);
        }
        if (self.m_keys.down == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(
                forward, g_rotation_matrices.backwards));
        }
        if (self.m_keys.left == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(
                forward, g_rotation_matrices.left));
        }
        if (self.m_keys.right == 1)
        {
            net.addInPlace(BABYLON.Vector3.TransformCoordinates(
                forward, g_rotation_matrices.right));
        }
        self.m_player.m_root_mesh.moveWithCollisions(net);
        self.cameraFollowPlayer();
    };

    //--------------------------------------------------------------------------
    self.cameraFollowPlayer = function()
    {
        self.m_player.m_root_mesh.rotation.y
            = -self.m_camera.alpha - Math.PI / 2;
        self.m_camera.target = self.m_player.m_root_mesh.position.clone();
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

    self.m_asserts_manager = new BABYLON.AssetsManager(self.m_scene);

    self.m_room_a = new Room("room_a", self.m_scene);
    self.m_room_a.scheduleLoad(self.m_asserts_manager,
        "assets/levels/double_pathway/",
        "double_pathway.babylon");

    self.m_player = new Player(self.m_scene);
    self.m_player.scheduleLoad(self.m_asserts_manager,
        "assets/characters/man/", "man.babylon");

    self.m_camera = new BABYLON.ArcRotateCamera(
        'camera1', -Math.PI / 2, Math.PI / 2, 6,
        new BABYLON.Vector3.Zero(), self.m_scene);
    self.m_scene.activeCamera = self.m_camera;
    self.m_camera.attachControl(self.m_canvas, false);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    self.m_light = new BABYLON.HemisphericLight(
        'light1', new BABYLON.Vector3(0,1,0), self.m_scene);

    // Light directional
    self.m_light_directional = new BABYLON.DirectionalLight(
        "dir01", new BABYLON.Vector3(-1, -2, 1), self.m_scene);
    self.m_light_directional.diffuse = new BABYLON.Color3(1, 1, 1);
    self.m_light_directional.specular = new BABYLON.Color3(0, 0, 0);
    self.m_light_directional.position = new BABYLON.Vector3(250, 400, 0);
    self.m_light_directional.intensity = 0.8;

    if (g_game_options.debug_scene_mode)
    {
        self.m_scene.debugLayer.show();
    }

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

    self.m_asserts_manager.onFinish = function()
    {
        self.m_room_b = self.m_room_a.clone("room_b");
        self.m_room_b.m_root_mesh.position.x -= 21;
        self.m_room_b.m_root_mesh.rotation.y = -Math.PI / 2;
        self.m_room_b.m_root_mesh.rotation.x = -Math.PI;

        self.m_player.m_root_mesh.position.y = -4;
    };
    self.m_asserts_manager.load();
};

//##############################################################################

//------------------------------------------------------------------------------
function createScene()
{
    g_scene = new Scene();
}

//window.addEventListener('DOMContentLoaded', createScene);
