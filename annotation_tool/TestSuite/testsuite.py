from datetime import datetime
import os


class TestSuite:

    def __init__(self):
        self.core_path = 'C:/Projects/service_core/annotation_tool/TestSuite/'
        now = str(datetime.now()).replace(
            ':', '').replace(' ', '').replace('-', '')
        self.path = self.core_path + 'Reports/' + 'TestResult'+now + '.html'
        f = open(self.path, 'w')
        message = '<html>' + \
            '<link rel="stylesheet" type="text/css" href="../style.css">' + \
            '<script src="../jQuery.js"></script>' + \
            '<script src= "../script.js"></script>' + \
            '<head></head><body>'
        f.write(message)
        f.close()

    def createTestRecord(self, name, success, error=None, image=None):
        f = open(self.path, 'a')
        info = None
        if success:
            info = image
            message = '<div class="TestSuccess">'+name + \
                '</div>'+'<div class="info"><img src="' + info + '"></img>'
        else:
            info = error
            message = '<div class="TestError">'+name + \
                '</div>'+'<div class="info">' + info + '</div>'
        f.write(message)
        f.close()

    def getCorePath(self):
        return self.core_path
