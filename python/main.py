#!/usr/bin/env python
# coding=utf-8
import sys, re
from PIL import Image
import sys, os

import pyocr
import pyocr.builders

reload(sys)
sys.setdefaultencoding('utf8')


def main():
    tools = pyocr.get_available_tools()
    if len(tools) == 0:
        print("No OCR tool found")
        sys.exit(1)
    # The tools are returned in the recommended order of usage
    tool = tools[0]
    print("Will use tool '%s'" % (tool.get_name()))
    # Ex: Will use tool 'libtesseract'

    langs = tool.get_available_languages()
    print("Available languages: %s" % ", ".join(langs))
    lang = langs[0]
    print("Will use lang '%s'" % (lang))

    #cur_path = os.path.abspath('../source/char/8.png')
    cur_path = os.path.abspath('../source/code1.png')
    cur_path = os.path.normpath(cur_path)
    print(cur_path)

    digits = tool.image_to_string(
        Image.open(cur_path),
        lang=lang,
        builder=pyocr.tesseract.DigitBuilder()
    )
    print('__', digits, '__')

    '''
    code1.png   实际值：83271   输出值：33271
    code2.png   实际值：39652   输出值：39652
    char/6_real_1  实际值：6        输出值：空
    '''


if __name__ == "__main__":
    main()
