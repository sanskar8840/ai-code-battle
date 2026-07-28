#include <stdio.h>
#include <string.h>

int main() {
    char s[100001];
    if (fgets(s, sizeof(s), stdin) == NULL) s[0] = '\0';
    s[strcspn(s, "\n")] = '\0';

    // TODO: implement your solution using s
    printf("false\n");
    return 0;
}
