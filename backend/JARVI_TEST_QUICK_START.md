# Jarvi Request Injection Test - Quick Start

## What This Does

Tests Jarvi's request processing by injecting mock responses at the optimal pipeline point: **`parseJarviResponse()`** in [`backend/src/services/jarvi-service/index.js:213`](backend/src/services/jarvi-service/index.js:213)

This allows you to:
- ✓ Test user requests with controlled responses
- ✓ Validate intent detection and delegation routing
- ✓ Simulate error conditions and edge cases
- ✓ Verify response parsing and formatting

## Quick Commands

### Run Basic Tests (10 scenarios)
```bash
node backend/test_jarvi_request_injection.js
```
**Expected:** 100% success rate (10/10 tests pass)

### Run Advanced Tests (10 scenarios + error handling)
```bash
node backend/test_jarvi_advanced_injection.js
```
**Expected:** 90% success rate (9/10 tests pass, 1 skipped)

### Run Both
```bash
node backend/test_jarvi_request_injection.js && node backend/test_jarvi_advanced_injection.js
```

## Test Coverage

### Basic Suite (10 tests)
1. ✓ Greeting requests
2. ✓ Capability requests (Jarvi)
3. ✓ Capability requests (Grim)
4. ✓ Calendar event creation
5. ✓ Task creation
6. ✓ Calendar get requests
7. ✓ Task list requests
8. ✓ General knowledge questions
9. ✓ Event updates
10. ✓ Task deletion

### Advanced Suite (10 tests)
1. ✓ Malformed JSON handling
2. ✓ JSON extraction from mixed text
3. ⊘ Empty message validation (skipped - handled at validation layer)
4. ✓ Very long messages
5. ✓ Special characters
6. ✓ Unicode support
7. ✓ Invalid delegation structures
8. ✓ Multiple consecutive requests
9. ✓ LLM timeout handling
10. ✓ Memory service failure handling

## Test Output Example

```
================================================================================
JARVI REQUEST INJECTION TEST SUITE
Testing optimal injection point: parseJarviResponse()
================================================================================

[1] ✓ PASS - Greeting Request
    Message: "Hey Jarvi, how are you?"
    Intent: general_query
    Delegated: false

[2] ✓ PASS - Capability Request - Jarvi
    Message: "What can you do?"
    Intent: get_goals
    Delegated: true

...

================================================================================
SUMMARY
--------------------------------------------------------------------------------
Total Tests: 10
Passed: 10 ✓
Failed: 0 ✗
Success Rate: 100.00%
================================================================================
```

## How It Works

```
User Request
    ↓
Mock LLM Service (Injected)
    ↓
parseJarviResponse() ← OPTIMAL INJECTION POINT
    ↓
Result Validation
    ↓
Test Pass/Fail
```

## Key Test Scenarios

### Delegation Tests
```javascript
// Input: "Create an event called Meeting at 2pm tomorrow"
// Mock Response: {"Recipient":"Grim","RequestType":"create_event","Message":"..."}
// Expected: delegationJson !== null, intent = "create_event"
```

### Direct Response Tests
```javascript
// Input: "Hey Jarvi, how are you?"
// Mock Response: "Sir, your concern for my well-being is touching..."
// Expected: delegationJson === null, intent = "general_query"
```

### Error Handling Tests
```javascript
// Input: "Create an event"
// Mock Response: Throws timeout error
// Expected: Fallback sarcastic response returned
```

## Response Types Tested

### Delegation JSON
```json
{
  "Recipient": "Grim|Murphy|JARVI",
  "RequestType": "create_event|get_task|get_goals|...",
  "Message": "User's original request"
}
```

### Plain Text Response
```
"Sir, your concern for my well-being is touching, though entirely unnecessary."
```

### Error Response
```json
{
  "responseToUser": "Sir, I've encountered a temporary setback. Do try again.",
  "delegationJson": null,
  "intentAnalysis": {"intent": "error", "entities": {"error": "..."}}
}
```

## Request Types Validated

**Calendar (Grim):** create_event, get_event, update_event, delete_event  
**Tasks (Murphy):** create_task, get_task, update_task, delete_task, complete_task  
**Capabilities (JARVI):** get_goals

## Files Created

1. **`test_jarvi_request_injection.js`** - Basic test suite (10 tests)
2. **`test_jarvi_advanced_injection.js`** - Advanced test suite (10 tests)
3. **`JARVI_REQUEST_INJECTION_TEST_GUIDE.md`** - Comprehensive documentation
4. **`JARVI_TEST_QUICK_START.md`** - This file

## Extending Tests

Add new test scenarios to the `TEST_SCENARIOS` or `ADVANCED_SCENARIOS` arrays:

```javascript
{
  name: 'Your Test Name',
  userMessage: 'User input here',
  mockResponse: 'Expected LLM response',
  expectedIntent: 'intent_type',
  shouldDelegate: true/false
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No mock responses configured" | Ensure `setMockResponse()` called before test |
| Delegation not working | Check JSON structure: `Recipient`, `RequestType`, `Message` |
| Tests timing out | Verify mocks return quickly, no real API calls |
| Memory errors | Mock memory service is auto-provided |

## Performance

- **Basic tests:** ~50ms total
- **Advanced tests:** ~100ms total
- **Per-test average:** <10ms (with mocks)

## Next Steps

1. Run basic tests: `node backend/test_jarvi_request_injection.js`
2. Run advanced tests: `node backend/test_jarvi_advanced_injection.js`
3. Review results and validate all tests pass
4. Add custom test scenarios as needed
5. Integrate into CI/CD pipeline

## Documentation

For detailed information, see [`JARVI_REQUEST_INJECTION_TEST_GUIDE.md`](JARVI_REQUEST_INJECTION_TEST_GUIDE.md)

---

**Optimal Injection Point:** [`backend/src/services/jarvi-service/index.js:213`](backend/src/services/jarvi-service/index.js:213)  
**Test Success Rate:** 100% basic, 90% advanced  
**Total Test Coverage:** 19 scenarios + error handling
