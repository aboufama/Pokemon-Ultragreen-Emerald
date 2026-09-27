// Messages to the browser's console.

#include <stdarg.h>
#include "gba.h"

static char *Put(char *p, char *end, char c)
{
    if (p < end)
        *p++ = c;
    return p;
}

static char *Number(char *p, char *end, u32 v, int base, int neg, int width, char pad)
{
    char digits[12];
    int n = 0;
    do {
        u32 d = v % base;
        digits[n++] = (char)(d < 10 ? '0' + d : 'a' + d - 10);
        v /= base;
    } while (v);
    if (neg)
        digits[n++] = '-';
    for (int i = n; i < width; i++)
        p = Put(p, end, pad);
    while (n)
        p = Put(p, end, digits[--n]);
    return p;
}

void PlatformLogf(const char *fmt, ...)
{
    char buf[512];
    char *p = buf, *end = buf + sizeof(buf) - 1;
    va_list ap;
    va_start(ap, fmt);
    for (; *fmt; fmt++) {
        if (*fmt != '%') {
            p = Put(p, end, *fmt);
            continue;
        }
        fmt++;
        char pad = ' ';
        int width = 0;
        if (*fmt == '0') {
            pad = '0';
            fmt++;
        }
        while (*fmt >= '0' && *fmt <= '9')
            width = width * 10 + (*fmt++ - '0');
        if (*fmt == 'l')
            fmt++;
        switch (*fmt) {
        case 'd': case 'i': {
            s32 v = va_arg(ap, s32);
            p = Number(p, end, v < 0 ? -(u32)v : (u32)v, 10, v < 0, width, pad);
            break;
        }
        case 'u': p = Number(p, end, va_arg(ap, u32), 10, 0, width, pad); break;
        case 'x': case 'p': p = Number(p, end, va_arg(ap, u32), 16, 0, width, pad); break;
        case 'c': p = Put(p, end, (char)va_arg(ap, int)); break;
        case 's': {
            const char *s = va_arg(ap, const char *);
            while (s && *s)
                p = Put(p, end, *s++);
            break;
        }
        case '%': p = Put(p, end, '%'); break;
        default: break;
        }
    }
    va_end(ap);
    *p = 0;
    PlatformHostLog(buf);
}
