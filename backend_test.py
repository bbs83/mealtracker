#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MealTrackAPITester:
    def __init__(self, base_url="https://mealtrack-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.assessment_id = None
        self.plan_id = None

    def log(self, message):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)
            else:
                self.log(f"❌ Invalid HTTP method: {method}")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except json.JSONDecodeError:
                    return True, {}
            else:
                self.log(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_body = response.json()
                    self.log(f"   Error: {error_body}")
                except:
                    self.log(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.Timeout:
            self.log(f"❌ FAILED - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            self.log(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test("Health Check", "GET", "", 200)
        if success:
            self.log(f"   API Message: {response.get('message', 'N/A')}")
        return success

    def test_signup(self):
        """Test user signup"""
        test_timestamp = datetime.now().strftime("%H%M%S")
        signup_data = {
            "name": f"Test User {test_timestamp}",
            "email": f"test_{test_timestamp}@mealtrack.test",
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test("User Signup", "POST", "auth/signup", 200, signup_data)
        
        if success:
            self.token = response.get('token')
            self.user_data = response.get('user')
            self.log(f"   User created: {self.user_data.get('name')} ({self.user_data.get('email')})")
            self.log(f"   Token received: {self.token[:20]}..." if self.token else "   No token received")
        
        return success

    def test_login(self):
        """Test user login with existing credentials"""
        if not self.user_data:
            self.log("⚠️  Skipping login test - no user data from signup")
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPassword123!"
        }
        
        # Clear token to test login
        old_token = self.token
        self.token = None
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success:
            self.token = response.get('token')
            self.log(f"   Login successful for: {response.get('user', {}).get('email')}")
        else:
            self.token = old_token  # Restore token if login fails
        
        return success

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            self.log("⚠️  Skipping get me test - no auth token")
            return False
            
        success, response = self.run_test("Get Current User", "GET", "auth/me", 200)
        
        if success:
            user = response.get('user', {})
            self.log(f"   User info: {user.get('name')} - {user.get('email')}")
        
        return success

    def test_create_assessment(self):
        """Test creating an assessment"""
        if not self.token:
            self.log("⚠️  Skipping assessment test - no auth token")
            return False
            
        # Sample assessment data matching the form structure
        assessment_data = {
            "patient_data": {
                "name": self.user_data.get('name', 'Test User'),
                "age": 30,
                "sex": "female",
                "weight": 65.0,
                "height": 165,
                "primary_goal": "lose_weight",
                "target_weight": 60.0,
                "activity_level": "moderate",
                "dietary_restrictions": "nenhuma",
                "allergies": "nenhuma",
                "health_conditions": "nenhuma"
            }
        }
        
        success, response = self.run_test("Create Assessment", "POST", "assessments", 200, assessment_data)
        
        if success:
            self.assessment_id = response.get('id')
            self.log(f"   Assessment created with ID: {self.assessment_id}")
        
        return success

    def test_list_assessments(self):
        """Test listing user assessments"""
        if not self.token:
            self.log("⚠️  Skipping list assessments - no auth token")
            return False
            
        success, response = self.run_test("List Assessments", "GET", "assessments", 200)
        
        if success:
            assessments = response if isinstance(response, list) else []
            self.log(f"   Found {len(assessments)} assessment(s)")
        
        return success

    def test_get_assessment(self):
        """Test getting specific assessment"""
        if not self.token or not self.assessment_id:
            self.log("⚠️  Skipping get assessment - no auth token or assessment ID")
            return False
            
        success, response = self.run_test("Get Assessment", "GET", f"assessments/{self.assessment_id}", 200)
        
        if success:
            self.log(f"   Assessment retrieved: {response.get('status', 'unknown')} status")
        
        return success

    def test_list_plans(self):
        """Test listing user plans"""
        if not self.token:
            self.log("⚠️  Skipping list plans - no auth token")
            return False
            
        success, response = self.run_test("List Plans", "GET", "plans", 200)
        
        if success:
            plans = response if isinstance(response, list) else []
            self.log(f"   Found {len(plans)} plan(s)")
            if plans:
                self.plan_id = plans[0].get('id')
                self.log(f"   Latest plan ID: {self.plan_id}")
        
        return success

    def test_generate_plan(self):
        """Test plan generation (but skip waiting for completion)"""
        if not self.token or not self.assessment_id:
            self.log("⚠️  Skipping plan generation - no auth token or assessment ID")
            return False
            
        self.log("🔄 Testing plan generation (will not wait for AI completion)")
        
        success, response = self.run_test(
            "Generate Plan", 
            "POST", 
            f"assessments/{self.assessment_id}/generate-plan", 
            200, 
            {},
            timeout=60
        )
        
        if success:
            plan_status = response.get('status', 'unknown')
            self.plan_id = response.get('id')
            self.log(f"   Plan creation initiated: {plan_status} status")
            self.log(f"   Plan ID: {self.plan_id}")
            if plan_status == 'generating':
                self.log("   ⏳ Plan is being generated by AI (this can take 30-60 seconds)")
        
        return success

    def run_all_tests(self):
        """Run all API tests in sequence"""
        self.log("🚀 Starting MealTrack API Tests")
        self.log("=" * 50)
        
        test_results = []
        
        # Health check
        test_results.append(("Health Check", self.test_health_check()))
        
        # Authentication flow
        test_results.append(("User Signup", self.test_signup()))
        test_results.append(("User Login", self.test_login()))
        test_results.append(("Get Current User", self.test_get_me()))
        
        # Assessment flow
        test_results.append(("Create Assessment", self.test_create_assessment()))
        test_results.append(("List Assessments", self.test_list_assessments()))
        test_results.append(("Get Assessment", self.test_get_assessment()))
        
        # Plan flow
        test_results.append(("List Plans", self.test_list_plans()))
        test_results.append(("Generate Plan", self.test_generate_plan()))
        
        # Results summary
        self.log("=" * 50)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 50)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name}")
        
        self.log(f"\n📈 Overall Results: {self.tests_passed}/{self.tests_run} tests passed")
        self.log(f"🎯 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All API tests passed!")
            return 0
        else:
            self.log("⚠️  Some API tests failed - check logs above")
            return 1

def main():
    tester = MealTrackAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())