# Module 1: Implementation Guide

## Step 1: ROS 2 Installation

```bash
# Add ROS 2 repository
sudo apt update && sudo apt install -y software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# Install ROS 2 Humble
sudo apt update
sudo apt install ros-humble-desktop python3-colcon-common-extensions
```

## Step 2: Workspace Setup

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
source /opt/ros/humble/setup.bash
colcon build
source install/setup.bash
```

## Step 3: Create Package

```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_robot_pkg --dependencies rclpy std_msgs geometry_msgs sensor_msgs
```

## Step 4: Publisher Node

```python
# my_robot_pkg/publisher_node.py
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self):
        super().__init__('publisher_node')
        self.publisher = self.create_publisher(String, 'topic', 10)
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello ROS 2'
        self.publisher.publish(msg)

def main():
    rclpy.init()
    node = PublisherNode()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Step 5: Robot Controller

```python
# my_robot_pkg/robot_controller.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan

class RobotController(Node):
    def __init__(self):
        super().__init__('robot_controller')
        self.cmd_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.laser_sub = self.create_subscription(LaserScan, 'scan', self.laser_callback, 10)
        self.timer = self.create_timer(0.1, self.control_loop)
        self.min_distance = float('inf')

    def laser_callback(self, msg):
        self.min_distance = min(msg.ranges)

    def control_loop(self):
        cmd = Twist()
        if self.min_distance > 0.5:
            cmd.linear.x = 0.5
        else:
            cmd.angular.z = 0.5
        self.cmd_pub.publish(cmd)

def main():
    rclpy.init()
    node = RobotController()
    rclpy.spin(node)
    rclpy.shutdown()
```

## Step 6: URDF Model

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <link name="base_link">
    <visual>
      <geometry><box size="0.5 0.3 0.2"/></geometry>
      <material name="blue"><color rgba="0 0 1 1"/></material>
    </visual>
  </link>
  <link name="head">
    <visual>
      <geometry><sphere radius="0.1"/></geometry>
    </visual>
  </link>
  <joint name="neck" type="fixed">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.3"/>
  </joint>
</robot>
```

## Step 7: Launch File

```python
# launch/robot.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='my_robot_pkg', executable='robot_controller', output='screen'),
    ])
```

## Step 8: Build and Run

```bash
cd ~/ros2_ws
colcon build
source install/setup.bash
ros2 launch my_robot_pkg robot.launch.py
```
