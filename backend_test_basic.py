#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class BasicAPITester:
    def __init__(self, base_url="https://mealtrack-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0

    def log(self, message):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
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
        """Test user signup with unique email"""
        test_timestamp = datetime.now().strftime("%H%M%S%f")[:-3]  # Include milliseconds
        signup_data = {
            "name": f"Test User {test_timestamp}",
            "email": f"test_{test_timestamp}@mealtrack.test",
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test("User Signup", "POST", "auth/signup", 200, signup_data)
        
        if success:
            self.token = response.get('token')
            self.user_data = response.get('user')
            self.log(f"   User created: {self.user_data.get('email')}")
        
        return success

    def test_get_active_plan(self):
        """Test getting active plan"""
        if not self.token:
            return False
            
        success, response = self.run_test("Get Active Plan", "GET", "active-plan", 200)
        
        if success:
            plan = response.get('plan')
            self.log(f"   Active plan: {'Found' if plan else 'None'}")
        
        return success

    def test_get_meal_calendar(self):
        """Test getting meal calendar"""
        if not self.token:
            return False
            
        success, response = self.run_test("Get Meal Calendar", "GET", "meal-logs/calendar", 200)
        
        if success:
            year = response.get('year')
            month = response.get('month')
            days = response.get('days', {})
            self.log(f"   Calendar for {year}-{month}: {len(days)} days")
        
        return success

    def test_get_weekly_summary(self):
        """Test getting weekly summary"""
        if not self.token:
            return False
            
        success, response = self.run_test("Get Weekly Summary", "GET", "meal-logs/weekly-summary", 200)
        
        if success:
            days_tracked = response.get('days_tracked', 0)
            self.log(f"   Days with tracking: {days_tracked}")
        
        return success

    def test_get_meal_logs_today(self):
        """Test getting meal logs for today"""
        if not self.token:
            return False
            
        today = datetime.now().strftime("%Y-%m-%d")
        success, response = self.run_test("Get Meal Logs Today", "GET", f"meal-logs?date={today}", 200)
        
        if success:
            logs = response if isinstance(response, list) else []
            self.log(f"   Found {len(logs)} meal log(s) for today")
        
        return success

    def run_core_tests(self):
        """Run core API tests without AI operations"""
        self.log("🚀 Starting Core MealTrack API Tests")
        self.log("=" * 50)
        
        test_results = []
        
        # Basic tests
        test_results.append(("Health Check", self.test_health_check()))
        test_results.append(("User Signup", self.test_signup()))
        test_results.append(("Get Active Plan", self.test_get_active_plan()))
        test_results.append(("Get Meal Calendar", self.test_get_meal_calendar()))
        test_results.append(("Get Weekly Summary", self.test_get_weekly_summary()))
        test_results.append(("Get Meal Logs Today", self.test_get_meal_logs_today()))
        
        # Results summary
        self.log("=" * 50)
        self.log("📊 CORE TEST RESULTS")
        self.log("=" * 50)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name}")
        
        self.log(f"\n📈 Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        return self.tests_passed, self.tests_run

def main():
    tester = BasicAPITester()
    passed, total = tester.run_core_tests()
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())