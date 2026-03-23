
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublic() {
        return ResponseEntity.ok(Map.of("data", "anyone can see this"));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getHealth() {
        return ResponseEntity.ok(Map.of("status", "origin alive"));
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, String>> getProtected(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Missing X-User-Id header"));
        }

        return ResponseEntity.ok(Map.of(
                "data", "you passed JWT + rate limit",
                "user", userId));
    }
}
