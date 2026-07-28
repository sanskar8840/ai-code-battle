#include <stdio.h>
#include <string.h>

int main() {
    char a[10001], b[10001];
    if (fgets(a, sizeof(a), stdin) == NULL) a[0] = '\0';
    if (fgets(b, sizeof(b), stdin) == NULL) b[0] = '\0';
    a[strcspn(a, "\n")] = '\0';
    b[strcspn(b, "\n")] = '\0';

    // TODO: implement your solution using a and b
    printf("0\n");
    return 0;
}
