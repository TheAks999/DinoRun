/**
 * Created by sejones on 11/4/2016.
 */

MovementSurface = function (u_max, v_max, to_world_transform)
{
    var self = this;
    self.m_u_max = u_max;
    self.m_v_max = v_max;
    self.m_to_world_transform = to_world_transform;
    self.TransformToWorld = function (u, v)
    {
        return self.m_to_world_transform.Transform(
            BABYLON.Vector3(u - self.u_max / 2, v - self.v_max / 2, 0));
    }
};

EdgeLink = function (left_movement_surface, right_movement_surface)
{
    var self = this;
    self.m_left_movement_surface = left_movement_surface;
    self.m_right_movement_surface = right_movement_surface;

};
SurfaceGraph = function()
{
    var self = this;
    self.m_surfaces = [];
    self.AddSurface = function (surface)
    {
        self.m_surfaces.concat(surface);
    };
    self.ForEach = function(fn)
    {
      for (var key in self.m_surfaces)
      {
          fn(self.m_surfaces[key]);
      }
    };
    self.GetSurface = function(id)
    {
        return self.m_surfaces[i];
    }
};

SurfacePosition = function(u, v, id, surface_graph)
{
    var self = this;
    self.m_u = u;
    self.m_v = v;
    self.m_id = id;
    self.m_surface_graph = surface_graph;

    self.Move = function(delta_u, delta_v)
    {
    };

    self.GetWorldPosition = function()
    {
        return self.m_surface_graph
            .GetSurface(self.m_id)
            .TransformToWorld(u, v);
    }

};

CreateMap1 = function ()
{
    function InitialTransform(u, v)
    {
        //return BABYLON.Matrix.Identity()
        return BABYLON.Matrix.Translation(u / 2, v / 2, 0)
            .multiply(BABYLON.Matrix.RotationX(Math.PI/2))
    }
    var surfaces = SurfacePosition();
    surfaces.AddSurface(
        new MovementSurface(1, 1,
            InitialTransform(1, 1)
                .multiply(BABYLON.Matrix.Translation(0, 0, 1))));
    surfaces.AddSurface(
        new MovementSurface(1, Math.sqrt(2),
            InitialTransform(1, Math.sqrt(2))
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 1 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 0, 2)))));
    surfaces.AddSurface(
        new MovementSurface(1, 1,
            InitialTransform(1, 1)
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 2 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 1, 3)))));
    surfaces.AddSurface(
        new MovementSurface(1, Math.sqrt(2),
            InitialTransform(1, Math.sqrt(2))
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 3 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 2, 3)))));
    surfaces.AddSurface(
        new MovementSurface(1, 1,
            InitialTransform(1, 1)
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 4 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 3, 2)))));
    surfaces.AddSurface(
        new MovementSurface(1, Math.sqrt(2),
            InitialTransform(1, Math.sqrt(2))
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 5 / 4)
                   .multiply(BABYLON.Matrix.Translation(0, 3, 1)))));
    surfaces.AddSurface(
        new MovementSurface(1, 1,
            InitialTransform(1, 1)
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 6 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 2, 0)))));
    surfaces.AddSurface(
        new MovementSurface(1, Math.sqrt(2),
            InitialTransform(1, Math.sqrt(2))
                .multiply(BABYLON.Matrix.RotationX(-Math.PI * 7 / 4)
                    .multiply(BABYLON.Matrix.Translation(0, 1, 0)))));

    return surfaces;
};