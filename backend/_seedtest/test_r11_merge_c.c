#include <stdio.h>

int main() {
    int k;
    scanf("%d", &k);
    // TODO: read each list (size then values), merge them, print merged values on one line.
    for (int i = 0; i < k; i++) {
        int size;
        scanf("%d", &size);
        for (int j = 0; j < size; j++) { int v; scanf("%d", &v); }
    }
    printf("\n");
    return 0;
}
