from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from functools import wraps
from annotation_tool.TestSuite.testsuite import TestSuite


class FactoryTest(StaticLiveServerTestCase):
    # fixtures = ['user-data.json']

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_suite = TestSuite()
        cls.selenium = webdriver.Chrome(
            executable_path=r'C:\Users\BeetleJews\Downloads\chromedriver.exe')
        cls.selenium.implicitly_wait(10)
        cls.selenium.set_window_size(1024, 600)
        cls.selenium.maximize_window()
        cls.wait = WebDriverWait(cls.selenium, 10)
        cls.selenium.get('http://localhost:8000/annotation_tool/user_login/')
        username_input = cls.selenium.find_element_by_name("username")
        username_input.send_keys('admin')
        password_input = cls.selenium.find_element_by_name("password")
        password_input.send_keys('admin')
        element = cls.selenium.find_element_by_xpath(
            "//form/button[@type='submit']")
        cls.selenium.execute_script("arguments[0].click();", element)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def testPinFactory(self):
        print('start2')
        element = self.selenium.find_element_by_xpath(
            "//div[@class='article']/a")
        self.selenium.execute_script("arguments[0].click();", element)
        self.wait.until(EC.title_is('Интерфейс'))
        self.assertEquals(self.selenium.title, 'Интерфейс')

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@id='pin-factory']")))
        hover = ActionChains(self.selenium).move_to_element(element)
        hover.perform()
        element.click()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@id='create-pin']")))

        element.click()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@data-model='Object']")))

        hover = ActionChains(self.selenium).move_to_element(element)
        hover.perform()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@data-model='Object']/div[@class='item-open']")))
        element.click()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@class='pin-container']")))

        self.selenium.get_screenshot_as_file('FactoryTest')


class InfoTest(StaticLiveServerTestCase):
    # fixtures = ['user-data.json']

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_suite = TestSuite()
        cls.selenium = webdriver.Chrome(
            executable_path=r'C:\Users\BeetleJews\Downloads\chromedriver.exe')
        cls.selenium.implicitly_wait(10)
        cls.selenium.set_window_size(1024, 600)
        cls.selenium.maximize_window()
        cls.wait = WebDriverWait(cls.selenium, 10)
        cls.selenium.get('http://localhost:8000/annotation_tool/user_login/')
        username_input = cls.selenium.find_element_by_name("username")
        username_input.send_keys('admin')
        password_input = cls.selenium.find_element_by_name("password")
        password_input.send_keys('admin')
        element = cls.selenium.find_element_by_xpath(
            "//form/button[@type='submit']")
        cls.selenium.execute_script("arguments[0].click();", element)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def testWindow(self):
        try:
            self.wait.until(EC.title_is('Антология'))
            element = self.selenium.find_element_by_xpath(
                "//div[@class='article']/a")
            self.selenium.execute_script("arguments[0].click();", element)
            self.wait.until(EC.title_is('Интерфейс'))
            self.assertEquals(self.selenium.title, 'Интерфейс')

            element = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[@data-pk='1']")))

            hover = ActionChains(self.selenium).move_to_element(element)
            hover.perform()

            element = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[@data-pk='1']/div[@class='item-open']")))
            element.click()

            element = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[@class='close-window']")))

            image_name = self.test_suite.getCorePath() + '/Reports/screenshot-1.png'
            self.selenium.get_screenshot_as_file(image_name)
            element.click()
            self.test_suite.createTestRecord('Test1', True, None, image_name)

        except Exception as e:
            self.test_suite.createTestRecord(
                'Test1', False, 'Failed: ' + str(e), None)
            self.fail("Fail")


class SearchTest(StaticLiveServerTestCase):
    # fixtures = ['user-data.json']

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.test_suite = TestSuite()
        cls.selenium = webdriver.Chrome(
            executable_path=r'C:\Users\BeetleJews\Downloads\chromedriver.exe')
        cls.selenium.implicitly_wait(10)
        cls.selenium.set_window_size(1024, 600)
        cls.selenium.maximize_window()
        cls.wait = WebDriverWait(cls.selenium, 10)
        cls.selenium.get('http://localhost:8000/annotation_tool/user_login/')
        username_input = cls.selenium.find_element_by_name("username")
        username_input.send_keys('admin')
        password_input = cls.selenium.find_element_by_name("password")
        password_input.send_keys('admin')
        element = cls.selenium.find_element_by_xpath(
            "//form/button[@type='submit']")
        cls.selenium.execute_script("arguments[0].click();", element)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()

    def testPinFactory(self):
        print('start2')
        element = self.selenium.find_element_by_xpath(
            "//div[@class='article']/a")
        self.selenium.execute_script("arguments[0].click();", element)
        self.wait.until(EC.title_is('Интерфейс'))
        self.assertEquals(self.selenium.title, 'Интерфейс')

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@id='pin-factory']")))
        hover = ActionChains(self.selenium).move_to_element(element)
        hover.perform()
        element.click()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@id='open-search']")))

        element.click()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@id='confirm-search']")))

        hover = ActionChains(self.selenium).move_to_element(element)
        hover.perform()

        element = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//div[@data-model='Object']/div[@class='item-open']")))

        self.selenium.get_screenshot_as_file('SeachTest')
