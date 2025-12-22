# Module 2: Implementation Guide

## Step 1: Gazebo Installation

```bash
# Install Gazebo Fortress
sudo apt update
sudo apt install ros-humble-gazebo-ros-pkgs

# Verify installation
gazebo --version
```

## Step 2: Create World File

```xml
<!-- worlds/robot_world.sdf -->
<?xml version="1.0"?>
<sdf version="1.8">
  <world name="robot_world">
    <physics type="ode">
      <gravity>0 0 -9.81</gravity>
    </physics>

    <include>
      <uri>model://ground_plane</uri>
    </include>

    <include>
      <uri>model://sun</uri>
    </include>

    <model name="box">
      <pose>2 0 0.5 0 0 0</pose>
      <link name="link">
        <collision name="collision">
          <geometry><box><size>1 1 1</size></box></geometry>
        </collision>
        <visual name="visual">
          <geometry><box><size>1 1 1</size></box></geometry>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Step 3: Sensor Configuration

```xml
<!-- LiDAR sensor plugin -->
<sensor name="lidar" type="ray">
  <pose>0 0 0.5 0 0 0</pose>
  <ray>
    <scan>
      <horizontal>
        <samples>360</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>10.0</max>
    </range>
  </ray>
  <plugin name="laser" filename="libgazebo_ros_ray_sensor.so">
    <ros><remapping>~/out:=scan</remapping></ros>
    <output_type>sensor_msgs/LaserScan</output_type>
  </plugin>
</sensor>

<!-- Camera sensor plugin -->
<sensor name="camera" type="camera">
  <camera>
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>640</width>
      <height>480</height>
    </image>
  </camera>
  <plugin name="camera" filename="libgazebo_ros_camera.so">
    <ros><remapping>~/image_raw:=camera/image</remapping></ros>
  </plugin>
</sensor>
```

## Step 4: Isaac Sim Setup

```bash
# Download Omniverse Launcher
wget https://install.launcher.omniverse.nvidia.com/installers/omniverse-launcher-linux.AppImage
chmod +x omniverse-launcher-linux.AppImage
./omniverse-launcher-linux.AppImage

# Install Isaac Sim from Launcher
# Open Launcher > Exchange > Isaac Sim > Install
```

## Step 5: Isaac Sim Python Script

```python
# isaac_sim_example.py
from omni.isaac.kit import SimulationApp
simulation_app = SimulationApp({"headless": False})

from omni.isaac.core import World
from omni.isaac.core.robots import Robot
from omni.isaac.core.utils.stage import add_reference_to_stage

world = World()

# Add ground plane
world.scene.add_default_ground_plane()

# Add robot
robot_prim_path = "/World/Robot"
add_reference_to_stage(usd_path="robot.usd", prim_path=robot_prim_path)

# Reset world
world.reset()

# Simulation loop
while simulation_app.is_running():
    world.step(render=True)

simulation_app.close()
```

## Step 6: Isaac ROS VSLAM

```bash
# Install Isaac ROS
sudo apt install ros-humble-isaac-ros-visual-slam

# Launch VSLAM
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py
```

## Step 7: Nav2 Configuration

```yaml
# nav2_params.yaml
bt_navigator:
  ros__parameters:
    global_frame: map
    robot_base_frame: base_link

controller_server:
  ros__parameters:
    controller_frequency: 20.0

planner_server:
  ros__parameters:
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
```

## Step 8: Launch Navigation

```bash
# Launch Nav2
ros2 launch nav2_bringup navigation_launch.py params_file:=nav2_params.yaml

# Set goal via RViz2 or command
ros2 topic pub /goal_pose geometry_msgs/PoseStamped "..."
```

## Verification Checklist
- [ ] Gazebo world loads correctly
- [ ] Sensors publish to ROS 2 topics
- [ ] Isaac Sim renders photorealistically
- [ ] VSLAM tracks camera pose
- [ ] Nav2 navigates autonomously
