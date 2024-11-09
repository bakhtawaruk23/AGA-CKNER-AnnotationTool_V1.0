<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $uploadDir = 'uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $uploadFile = $uploadDir . basename($_FILES['file']['name']);

        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
            $content = file_get_contents($uploadFile);
            echo json_encode(['success' => true, 'content' => $content]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to upload file.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

?>