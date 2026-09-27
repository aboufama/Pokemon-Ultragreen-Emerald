// The C library functions the game uses (newlib's on the GBA).

#include <string.h>
#include <stdint.h>

void *memcpy(void *dest, const void *src, size_t n)
{
    __builtin_memcpy(dest, src, n);  // memory.copy
    return dest;
}

void *memmove(void *dest, const void *src, size_t n)
{
    __builtin_memmove(dest, src, n);
    return dest;
}

void *memset(void *dest, int c, size_t n)
{
    __builtin_memset(dest, c, n);  // memory.fill
    return dest;
}

int memcmp(const void *a, const void *b, size_t n)
{
    const unsigned char *x = a, *y = b;
    for (; n; n--, x++, y++)
        if (*x != *y)
            return *x - *y;
    return 0;
}

int strcmp(const char *a, const char *b)
{
    while (*a && *a == *b)
        a++, b++;
    return (unsigned char)*a - (unsigned char)*b;
}

int strncmp(const char *a, const char *b, size_t n)
{
    for (; n; n--, a++, b++) {
        if (*a != *b)
            return (unsigned char)*a - (unsigned char)*b;
        if (!*a)
            return 0;
    }
    return 0;
}

size_t strlen(const char *s)
{
    const char *p = s;
    while (*p)
        p++;
    return p - s;
}

char *strcpy(char *dest, const char *src)
{
    char *d = dest;
    while ((*d++ = *src++))
        ;
    return dest;
}

char *strncpy(char *dest, const char *src, size_t n)
{
    size_t i = 0;
    for (; i < n && src[i]; i++)
        dest[i] = src[i];
    for (; i < n; i++)
        dest[i] = 0;
    return dest;
}

char *strcat(char *dest, const char *src)
{
    strcpy(dest + strlen(dest), src);
    return dest;
}
