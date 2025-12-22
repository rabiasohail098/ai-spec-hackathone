# Module 4: Implementation Guide

## Step 1: Install Dependencies

```bash
pip install torch torchvision opencv-python gym ultralytics
sudo apt install ros-humble-slam-toolbox ros-humble-navigation2
```

## Step 2: Supervised Learning

```python
# robot_classifier.py
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

class RobotClassifier(nn.Module):
    def __init__(self, input_size, num_classes):
        super().__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return self.fc3(x)

# Train model
model = RobotClassifier(10, 3)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters())

for epoch in range(100):
    outputs = model(train_data)
    loss = criterion(outputs, labels)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
```

## Step 3: Reinforcement Learning

```python
# q_learning.py
import numpy as np
import gym

env = gym.make('CartPole-v1')
Q = np.zeros([env.observation_space.n, env.action_space.n])
alpha = 0.1
gamma = 0.99
epsilon = 0.1

for episode in range(1000):
    state = env.reset()
    done = False

    while not done:
        if np.random.random() < epsilon:
            action = env.action_space.sample()
        else:
            action = np.argmax(Q[state])

        next_state, reward, done, _ = env.step(action)
        Q[state, action] += alpha * (reward + gamma * np.max(Q[next_state]) - Q[state, action])
        state = next_state
```

## Step 4: Object Detection (YOLO)

```python
# object_detection.py
from ultralytics import YOLO
import cv2

model = YOLO('yolov8n.pt')

def detect_objects(image):
    results = model(image)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                'class': model.names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': box.xyxy[0].tolist()
            })
    return detections

# ROS 2 integration
import rclpy
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

class DetectionNode(Node):
    def __init__(self):
        super().__init__('detection_node')
        self.bridge = CvBridge()
        self.sub = self.create_subscription(Image, 'camera/image', self.callback, 10)

    def callback(self, msg):
        cv_image = self.bridge.imgmsg_to_cv2(msg)
        detections = detect_objects(cv_image)
        self.get_logger().info(f'Found: {detections}')
```

## Step 5: Visual SLAM

```bash
# Install ORB-SLAM3
git clone https://github.com/UZ-SLAMLab/ORB_SLAM3.git
cd ORB_SLAM3
chmod +x build.sh
./build.sh

# Run with RealSense
./Examples/Monocular/mono_realsense_D435i Vocabulary/ORBvoc.txt Examples/Monocular/RealSense_D435i.yaml
```

## Step 6: OpenCV Pipeline

```python
# vision_pipeline.py
import cv2
import numpy as np

def process_image(image):
    # Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Edge detection
    edges = cv2.Canny(gray, 50, 150)

    # Feature detection
    orb = cv2.ORB_create()
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    return edges, keypoints, descriptors

def detect_obstacles(depth_image, threshold=1.0):
    obstacles = depth_image < threshold
    return obstacles
```

## Step 7: Nav2 Configuration

```yaml
# nav2_params.yaml
controller_server:
  ros__parameters:
    controller_frequency: 20.0
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"

planner_server:
  ros__parameters:
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: true

global_costmap:
  ros__parameters:
    update_frequency: 1.0
    publish_frequency: 1.0
    robot_radius: 0.3
```

## Step 8: Launch Navigation

```bash
# Launch SLAM
ros2 launch slam_toolbox online_async_launch.py

# Launch Nav2
ros2 launch nav2_bringup navigation_launch.py

# Send goal
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {header: {frame_id: 'map'}, pose: {position: {x: 2.0, y: 1.0}, orientation: {w: 1.0}}}}"
```

## Verification Checklist
- [ ] ML models train successfully
- [ ] Object detection runs in real-time
- [ ] SLAM builds accurate map
- [ ] Navigation reaches goals
- [ ] System handles obstacles
