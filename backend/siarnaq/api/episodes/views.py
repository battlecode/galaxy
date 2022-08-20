# from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse


def NewTest(request):
    return HttpResponse('Hellow World')