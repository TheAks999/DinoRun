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
    debug_scene_mode: false,
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

    self.m_mesh_name="player";
    self.m_inner_container_mesh = new BABYLON.Mesh("player", scene);
    self.m_child_meshes = [];

    self.m_inner_container_mesh.checkCollisions = true;
    self.m_inner_container_mesh.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
    self.m_inner_container_mesh.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    self.m_ellipsoid = BABYLON.MeshBuilder.CreateSphere(
        "player_ellipsoid",
        {
            diameterX:self.m_inner_container_mesh.ellipsoid.x*2,
            diameterY:self.m_inner_container_mesh.ellipsoid.y*2,
            diameterZ:self.m_inner_container_mesh.ellipsoid.z*2
        }, scene);
    self.m_ellipsoid.parent = self.m_inner_container_mesh;
    self.m_ellipsoid.position = self.m_inner_container_mesh.ellipsoidOffset
        .clone().addInPlace(new BABYLON.Vector3(0, -0.5, 0));
    self.m_ellipsoid_material = new BABYLON.StandardMaterial(
        "player_ellipsoid_material", scene);
    self.m_ellipsoid_material.alpha
        = g_game_options.debug_show_player_ellipsoid ? 0.5 : 0;
    self.m_ellipsoid_material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
    self.m_ellipsoid.material = self.m_ellipsoid_material;

    self.m_action_manager = new BABYLON.ActionManager(scene);
    self.m_ellipsoid.action_manager =self.m_action_manager;

    // // static CreateCylinder(
    // //    name, height, diameterTop, diameterBottom,
    // //    tessellation, subdivisions, scene, updatable, sideOrientation);
    // self.m_cylinder = BABYLON.Mesh.CreateCylinder(
    //    "player_cylinder", 2, 0.5, 1, 25, 2, scene);
    // self.m_cylinder.position.y = 1;
    // self.m_cylinder.parent = self.m_inner_container_mesh;
    //
    // self.m_box = BABYLON.Mesh.CreateBox(
    //    "player_box", 0.5, scene);
    // self.m_box.position.y = 1.5;
    // self.m_box.position.z = 0.5;
    // self.m_box.scaling.x = 2.0;
    // self.m_box.parent = self.m_inner_container_mesh;

    //--------------------------------------------------------------------------
    self.scheduleLoad = function(asserts_manager, root_url, scene_file_name)
    {
        var task = asserts_manager.addMeshTask(
            self.m_mesh_name + "_task", "", root_url,
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
            alert(self.m_mesh_name + " failed to load.")
        };
    };

    //--------------------------------------------------------------------------
    self.handleMeshLoadSuccess = function(
        new_meshes, particle_systems, skeletons)
    {
        for (var key in new_meshes)
        {
            var new_mesh = new_meshes[key];
            new_mesh.parent = self.m_inner_container_mesh;
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
        self.m_man.parent = self.m_inner_container_mesh;
    };

};

//------------------------------------------------------------------------------
var Room = function (room_name, instance_name, scene)
{
    var self = this;
    self.m_room_name = room_name;
    self.m_instance_name = instance_name;
    self.m_detail_name = self.m_room_name + "." + self.m_instance_name;
    self.m_mesh_name = self.m_instance_name;
    self.m_scene = scene;
    self.m_info = null;

    self.m_root_mesh
        = new BABYLON.Mesh(self.m_mesh_name+".otw-rot", self.m_scene);
    self.m_outer_container_mesh = self.m_root_mesh;
    self.m_inner_container_mesh = self.m_root_mesh;

    // self.m_origin_to_world_rotation_mesh
    //     = new BABYLON.Mesh(self.m_mesh_name+".otw-rot", self.m_scene);
    // self.m_origin_to_word_translation_mesh
    //     = new BABYLON.Mesh(self.m_mesh_name+".otw-trans", self.m_scene);
    // self.m_door_to_origin_rotation_mesh
    //     = new BABYLON.Mesh(self.m_mesh_name+".dto-rot", self.m_scene);
    // self.m_door_to_origin_translation_mesh
    //     = new BABYLON.Mesh(self.m_mesh_name+".dto-trans", self.m_scene);

    // self.m_outer_container_mesh = self.m_origin_to_word_translation_mesh;
    // self.m_inner_container_mesh = self.m_door_to_origin_translation_mesh;

    // self.m_origin_to_world_rotation_mesh.parent = self.m_origin_to_word_translation_mesh;
    // self.m_door_to_origin_rotation_mesh.parent = self.m_origin_to_world_rotation_mesh;
    // self.m_door_to_origin_translation_mesh.parent = self.m_door_to_origin_rotation_mesh;

    self.m_child_meshes = [];
    self.m_trough_meshes = [];
    self.m_gravity_meshes = [];
    self.m_door_meshes = [];

    self.m_origin_marker = BABYLON.Mesh.CreateLines("marker", [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, .1, 1)
    ], self.m_scene);
    self.m_origin_marker.parent = self.m_inner_container_mesh;

    self.m_door_marker = BABYLON.Mesh.CreateLines("marker", [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(.5, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, .5, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, .5),
        new BABYLON.Vector3(0, .1, .5)
    ], self.m_scene);
    self.m_door_marker.color = new BABYLON.Color3(0, 0, 1);
    self.m_door_marker.parent = self.m_inner_container_mesh;

    //--------------------------------------------------------------------------
    self.scheduleLoad = function(asserts_manager)
    {
        var meshes_names = "";
        var root_url = "assets/levels/" + self.m_room_name + "/";
        var scene_file_name = self.m_room_name + ".babylon";
        var desc_file_name = self.m_room_name + ".json";

        var mesh_task = asserts_manager.addMeshTask(
            self.m_detail_name + "_mesh_task", 
            meshes_names, root_url, scene_file_name);
        mesh_task.onSuccess = function (task)
        {
            self.handleMeshLoadSuccess(
                task.loadedMeshes,
                task.loadedParticleSystems,
                task.loadedSkeletons);
        };
        mesh_task.onError = function (task)
        {
            alert(self.m_detail_name + " failed to load.")
        };

        var text_task = asserts_manager.addTextFileTask(
            self.m_detail_name + "_text_task",
            root_url + desc_file_name);
        text_task.onSuccess = function (task)
        {
            self.handleTextLoadSuccess(task.text);
        };
        text_task.onError = function (task)
        {
            alert(self.m_detail_name + " failed to load.")
        };
    };

    //--------------------------------------------------------------------------
    self.handleMeshLoadSuccess = function (
        new_meshes, particle_systems, skeletons)
    {
        function linkMesh(mesh)
        {
            mesh.parent = self.m_inner_container_mesh;
            mesh.name = self.m_mesh_name + "." + mesh.id;
            self.m_child_meshes.push(mesh);
        }

        // link the members to the root mesh
        for (var key in new_meshes)
        {
            var new_mesh = new_meshes[key];
            linkMesh(new_mesh);
            for (var key_2 in self.m_scene.meshes)
            {
                var scene_mesh = self.m_scene.meshes[key_2];
                if (scene_mesh.sourceMesh === new_mesh)
                {
                    linkMesh(scene_mesh);
                }
            }
        }

        // identify troughs and gravity
        // turn on collisions for troughs
        for (key in self.m_child_meshes)
        {
            var mesh = self.m_child_meshes[key];
            mesh.m_tag = "";

            mesh.m_is_trough = false;
            if (mesh.id.substr(0, 3) == "Tr_")
            {
                mesh.checkCollisions = true;
                self.m_trough_meshes.push(mesh);
                mesh.m_is_trough = true;
            }

            mesh.m_is_gravity = false;
            if (mesh.id.substr(0, 5) == "Grav_")
            {
                self.m_gravity_meshes.push(mesh);
                mesh.m_is_gravity = true;
                mesh.m_tag = mesh.id.substr(5);
            }

            mesh.m_is_door = false;
            if (mesh.id.substr(0, 5) == "Door_")
            {
                self.m_door_meshes.push(mesh);
                mesh.m_is_door = true;
                mesh.m_tag = mesh.id.substr(5);
            }
        }
    };

    //--------------------------------------------------------------------------
    self.handleTextLoadSuccess = function (text)
    {
        self.m_info = JSON.parse(text)
    };

    //--------------------------------------------------------------------------
    self.clone = function(instance_name)
    {
        var new_room = new Room(self.m_room_name, instance_name, self.m_scene);
        new_room.m_info = self.m_info;
        var prefix = new_room.m_mesh_name + ".";
        for (key in self.m_child_meshes)
        {
            var mesh = self.m_child_meshes[key];
            var new_mesh = mesh.clone(new_room.m_mesh_name);
            if (new_mesh.id.substr(0, prefix.length) == prefix)
            {
                new_mesh.id = new_mesh.id.substr(prefix.length);
            }
            new_mesh.name = new_room.m_mesh_name + "." + new_mesh.id;
            new_mesh.parent = new_room.m_inner_container_mesh;
            new_room.m_child_meshes.push(new_mesh);

            new_mesh.m_tag = mesh.m_tag;

            new_mesh.m_is_trough = false;
            if (mesh.m_is_trough)
            {
                new_mesh.m_is_trough = true;
                new_room.m_trough_meshes.push(new_mesh);
            }

            new_mesh.m_is_gravity = false;
            if (mesh.m_is_gravity)
            {
                new_mesh.m_is_gravity = true;
                new_room.m_gravity_meshes.push(new_mesh);
            }

            new_mesh.m_is_door = false;
            if (mesh.m_is_door)
            {
                new_mesh.m_is_door = true;
                new_room.m_door_meshes.push(new_mesh);
            }
        }
        return new_room;
    };
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
            Math.sin(self.m_player.m_inner_container_mesh.rotation.y),
            0,
            Math.cos(self.m_player.m_inner_container_mesh.rotation.y));

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
        net.addInPlace(new BABYLON.Vector3(0, -.1, 0));
        self.m_player.m_inner_container_mesh.moveWithCollisions(net);
        //self.m_world_transform.position.subtractInPlace(self.m_player.m_inner_container_mesh.position);
        self.m_room_a.m_root_mesh.position.subtractInPlace(self.m_player.m_inner_container_mesh.position);
        self.m_room_b.m_root_mesh.position.subtractInPlace(self.m_player.m_inner_container_mesh.position);
        self.m_marker_2.position.subtractInPlace(self.m_player.m_inner_container_mesh.position);
        self.m_player.m_inner_container_mesh.position.x = 0;
        self.m_player.m_inner_container_mesh.position.y = 0;
        self.m_player.m_inner_container_mesh.position.z = 0;
        self.cameraFollowPlayer();

        if (!self.m_last_pos.equals(self.m_room_a.m_root_mesh.position))
        {
            console.log("pos: " + self.m_room_a.m_root_mesh.position.toString());
            self.m_last_pos.copyFrom(self.m_room_a.m_root_mesh.position);
        }


        // check for sensors
        for (var room_key in self.m_rooms)
        {
            var room = self.m_rooms[room_key];

            for (var gravity_mesh_key in room.m_gravity_meshes)
            {
                var gravity_mesh = room.m_gravity_meshes[gravity_mesh_key];
                if (self.m_gravity_mesh === gravity_mesh)
                {
                    continue;
                }
                if (self.m_player.m_ellipsoid.intersectsMesh(gravity_mesh, true))
                {
                    self.handleGravity(
                        room_key, room, gravity_mesh_key, gravity_mesh);
                }
            }

            for (var door_mesh_key in room.m_door_meshes)
            {
                var door_mesh = room.m_door_meshes[door_mesh_key];
                if (self.m_door_mesh === door_mesh)
                {
                    continue;
                }
                if (self.m_player.m_ellipsoid.intersectsMesh(door_mesh, true))
                {
                    self.handleDoor(
                        room_key, room, door_mesh_key, door_mesh);
                }
            }
        }
    };

    //--------------------------------------------------------------------------
    self.cameraFollowPlayer = function()
    {
        self.m_player.m_inner_container_mesh.rotation.y
            = -self.m_camera.alpha - Math.PI / 2;
        self.m_camera.target = self.m_player.m_inner_container_mesh.position.clone();
        self.m_camera.target.y += self.m_player.m_camera_y_offset;
    };

    //--------------------------------------------------------------------------
    self.handleGravity = function(
        room_key, room, gravity_mesh_key, gravity_mesh)
    {
        self.m_gravity_mesh = gravity_mesh;
        //console.log("Gravity:" + self.m_gravity_mesh.name);
    };

    //--------------------------------------------------------------------------
    self.handleDoor = function(
        room_key, room, door_mesh_key, door_mesh)
    {
        self.m_door_mesh = door_mesh;
        var tag = door_mesh.m_tag;
        var door_info = self.m_room_a.m_info.doors[tag];
        console.log("Door:" + door_mesh.name
            + " tag:" + tag
            + " connects_to:" + door_info.connects_to);
        var other_door_info = self.m_room_a.m_info.doors[door_info.connects_to];
        if (room !== self.m_room_a)
        {
            // console.log("Changed rooms");
            // var temp = self.m_room_a;
            // self.m_room_a = self.m_room_b;
            // self.m_room_b = temp;
            //
            // self.m_room_a.m_origin_to_word_translation_mesh.position
            //     .addInPlace(self.m_world_transform.position);
            // self.m_room_b.m_origin_to_word_translation_mesh.position
            //     .addInPlace(self.m_world_transform.position);
            // self.m_world_transform.position
            //     .subtractInPlace(self.m_world_transform.position);
        }
        else
        {
            console.log("Moving Room B");
            // self.m_marker.position.x = door_info.position[0];
            // self.m_marker.position.y = door_info.position[1];
            // self.m_marker.position.z = door_info.position[2];
            // self.m_marker.rotation.x = door_info.rotation[0];
            // self.m_marker.rotation.y = door_info.rotation[1];
            // self.m_marker.rotation.z = door_info.rotation[2];

            function getDoorTransform(door_info)
            {
                return BABYLON.Matrix.Identity()
                    .multiply(BABYLON.Matrix.RotationX(door_info.rotation[0]))
                    .multiply(BABYLON.Matrix.RotationY(door_info.rotation[1]))
                    .multiply(BABYLON.Matrix.RotationZ(door_info.rotation[2]))
                    .multiply(BABYLON.Matrix.Translation(
                        door_info.position[0],
                        door_info.position[1],
                        door_info.position[2]));
            }

            function setMeshFromMatrix(mesh, matrix)
            {
                var scale = new BABYLON.Vector3();
                var rotation_q = new BABYLON.Quaternion();
                var position = new BABYLON.Vector3();
                var result = matrix.decompose(scale, rotation_q, position);
                if (!result)
                {
                    alert("Decompose failed");
                    throw "Decompose failed";
                }
                mesh.scale = scale;
                mesh.rotation = BABYLON.Vector3.Zero();
                mesh.rotationQuaternion = rotation_q;
                mesh.position = position;
            }

            function logDecomposedMatrix(label, matrix)
            {
                var scale = new BABYLON.Vector3();
                var rotation_q = new BABYLON.Quaternion();
                var position = new BABYLON.Vector3();
                var result = matrix.decompose(scale, rotation_q, position);
                if (!result)
                {
                    alert("Decompose failed");
                    throw "Decompose failed";
                }
                console.log(label + " scale:" + (scale));
                console.log(label + " rotation_q:" + (rotation_q));
                console.log(label + " position:" + (position));
            }

            function getMatrixFromMesh(mesh)
            {
                var matrix = BABYLON.Matrix.Scaling(
                    mesh.scaling.x,
                    mesh.scaling.y,
                    mesh.scaling.z)
                    .multiply(BABYLON.Matrix.RotationX(mesh.rotation.x))
                    .multiply(BABYLON.Matrix.RotationX(mesh.rotation.y))
                    .multiply(BABYLON.Matrix.RotationX(mesh.rotation.z));
                if ("rotationQuaternion" in mesh
                    && null != mesh.rotationQuaternion)
                {
                    alert("Mesh has Quaternion");
                }
                return matrix.multiply(BABYLON.Matrix.Translation(
                    mesh.position.x,
                    mesh.position.y,
                    mesh.position.z));
            }

            var room_matrix = getMatrixFromMesh(self.m_room_a.m_root_mesh);
            logDecomposedMatrix("room_matrix", room_matrix);

            var door_matrix = getDoorTransform(door_info);
            logDecomposedMatrix("door_matrix", door_matrix);

            setMeshFromMatrix(self.m_room_a.m_door_marker, door_matrix);

            var to_door_matrix = door_matrix
                .multiply(room_matrix)
                ;
            logDecomposedMatrix("to_door_matrix", to_door_matrix);

            setMeshFromMatrix(self.m_marker_2, to_door_matrix);


            // var inv_to_door_matrix = inv_room_matrix
            //     .multiply(door_matrix);
            // logDecomposedMatrix("inv_to_door_matrix", inv_to_door_matrix);

            var other_door_matrix = getDoorTransform(other_door_info);
            logDecomposedMatrix("other_door_matrix", other_door_matrix);
            setMeshFromMatrix(self.m_room_b.m_door_marker, other_door_matrix);

            var other_door_adj_matrix = BABYLON.Matrix.RotationY(Math.PI)
                .multiply(other_door_matrix);
            logDecomposedMatrix("other_door_adj_matrix", other_door_adj_matrix);

            var matrix = other_door_adj_matrix
                .multiply(to_door_matrix)
                ;
            logDecomposedMatrix("matrix", matrix);
            setMeshFromMatrix(self.m_room_b.m_root_mesh, matrix);

            // self.m_room_b.m_root_mesh.rotation.x
            //     = other_door_info.rotation[0]
            //     // - door_info.rotation[0]
            // ;
            // self.m_room_b.m_root_mesh.rotation.y
            //     = other_door_info.rotation[1]
            //     // - door_info.rotation[1]
            // ;
            // self.m_room_b.m_root_mesh.rotation.z
            //     = other_door_info.rotation[2]
            //     // - door_info.rotation[2]
            // ;
            //
            // self.m_room_b.m_root_mesh.position.x
            //     = other_door_info.position[0]
            //     + door_info.position[0]
            //     + self.m_room_a.m_root_mesh.position.x
            // ;
            // self.m_room_b.m_root_mesh.position.y
            //     = other_door_info.position[1]
            //     + door_info.position[1]
            //     + self.m_room_a.m_root_mesh.position.y
            // ;
            // self.m_room_b.m_root_mesh.position.z
            //     = other_door_info.position[2]
            //     + door_info.position[2]
            //     + self.m_room_a.m_root_mesh.position.z
            // ;



            // self.m_room_b.m_origin_to_word_translation_mesh.position.x
            //     = door_info.position[0];
            // self.m_room_b.m_origin_to_word_translation_mesh.position.y
            //     = door_info.position[1];
            // self.m_room_b.m_origin_to_word_translation_mesh.position.z
            //     = door_info.position[2];
            //
            // self.m_room_b.m_origin_to_world_rotation_mesh.rotation.x
            //     = door_info.rotation[0];
            // self.m_room_b.m_origin_to_world_rotation_mesh.rotation.y
            //     = door_info.rotation[1];
            // self.m_room_b.m_origin_to_world_rotation_mesh.rotation.z
            //     = door_info.rotation[2];
            //
            // self.m_room_b.m_door_to_origin_translation_mesh.position.x
            //     = other_door_info.position[0];
            // self.m_room_b.m_door_to_origin_translation_mesh.position.y
            //     = other_door_info.position[1];
            // self.m_room_b.m_door_to_origin_translation_mesh.position.z
            //     = other_door_info.position[2];
            //
            // self.m_room_b.m_door_to_origin_rotation_mesh.rotation.x
            //     = -other_door_info.rotation[0];
            // self.m_room_b.m_door_to_origin_rotation_mesh.rotation.y
            //     = -other_door_info.rotation[1];
            // self.m_room_b.m_door_to_origin_rotation_mesh.rotation.z
            //     = -other_door_info.rotation[2];
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
    self.m_scene.collisionsEnabled = true;

    self.m_asserts_manager = new BABYLON.AssetsManager(self.m_scene);

    self.m_gravity_mesh = null;
    self.m_door_mesh = null;

    self.m_rooms = [];

    self.m_room_a = new Room("double_pathway", "a", self.m_scene);
    self.m_room_a.scheduleLoad(self.m_asserts_manager);

    self.m_player = new Player(self.m_scene);
    self.m_player.scheduleLoad(self.m_asserts_manager,
        "assets/characters/man/", "man.babylon");

    // Example code to load an obj.
    // var task = self.m_asserts_manager.addMeshTask(
    //     "cube", "", "assets/cube/",
    //     "cube.obj");
    // task.onSuccess = function (task)
    // {
    //     console.log(task);
    //     console.log(task.loadedMeshes);
    // };
    // task.onError = function (task)
    // {
    //     alert("obj failed to load.")
    // };

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

    self.m_marker = BABYLON.Mesh.CreateLines("marker", [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, .1, 1)
    ], self.m_scene);

    self.m_marker_2 = BABYLON.Mesh.CreateLines("marker", [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, .1, 1)
    ], self.m_scene);

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

    self.m_world_transform = new BABYLON.Mesh("world", self.m_scene);
    self.m_last_pos = BABYLON.Vector3.Zero();

    self.m_asserts_manager.onFinish = function()
    {
        self.m_room_b = self.m_room_a.clone("b");
        self.m_room_b.m_root_mesh.position.y -= 25;
        //self.m_room_b.m_rotation_mesh.rotation.y = -Math.PI / 2;
        //self.m_room_b.m_rotation_mesh.rotation.x = -Math.PI;


        self.m_rooms.push(self.m_room_a);
        self.m_rooms.push(self.m_room_b);

        //self.m_room_a.m_outer_container_mesh.parent = self.m_world_transform;
        //self.m_room_b.m_outer_container_mesh.parent = self.m_world_transform;

        // self.m_world_transform.position.x
        //     = -self.m_room_a.m_info.start_position[0];
        // self.m_world_transform.position.y
        //     = -self.m_room_a.m_info.start_position[1];
        // self.m_world_transform.position.z
        //     = -self.m_room_a.m_info.start_position[2];

        self.m_room_a.m_root_mesh.position.x
            = -self.m_room_a.m_info.start_position[0];
        self.m_room_a.m_root_mesh.position.y
            = -self.m_room_a.m_info.start_position[1];
        self.m_room_a.m_root_mesh.position.z
            = -self.m_room_a.m_info.start_position[2];
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
