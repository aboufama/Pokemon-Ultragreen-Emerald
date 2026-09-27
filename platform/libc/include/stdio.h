// <stdio.h> as far as the game uses it (libisagbprn.c's debug printing, which
// release builds compile out).
#ifndef PLATFORM_STDIO_H
#define PLATFORM_STDIO_H

#include <stddef.h>
#include <stdarg.h>

int vsnprintf(char *buf, size_t size, const char *fmt, va_list args);
int snprintf(char *buf, size_t size, const char *fmt, ...);
int vsprintf(char *buf, const char *fmt, va_list args);
int sprintf(char *buf, const char *fmt, ...);

#endif // PLATFORM_STDIO_H
