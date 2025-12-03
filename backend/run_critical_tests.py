import pytest
import sys
import os

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_critical_tests():
    print("="*60)
    print("RUNNING CRITICAL SCENARIO TESTS")
    print("="*60)
    
    test_files = [
        "tests/test_audit_ghost_staff.py",
        "tests/test_audit_timeline.py",
        "tests/test_audit_roles.py",
        "tests/test_audit_orphaned_data.py"
    ]
    
    exit_code = pytest.main(["-v"] + test_files)
    
    print("\n" + "="*60)
    if exit_code == 0:
        print("✅ ALL CRITICAL SCENARIOS PASSED")
    else:
        print("❌ SOME CRITICAL SCENARIOS FAILED")
    print("="*60)

if __name__ == "__main__":
    run_critical_tests()
