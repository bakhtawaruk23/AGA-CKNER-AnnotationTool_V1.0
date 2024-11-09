<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['filename']) && isset($data['content'])) {
        $filename = 'uploads/' . $data['filename'];
        if (file_put_contents($filename, $data['content']) !== false) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to save file.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid data received.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
