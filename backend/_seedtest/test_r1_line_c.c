#include <stdio.h>
#include <stdlib.h>

int main() {
    int cap = 16, n = 0;
    int *arr = malloc(cap * sizeof(int));
    int x;
    while (scanf("%d", &x) == 1) {
        if (n >= cap) { cap *= 2; arr = realloc(arr, cap * sizeof(int)); }
        arr[n++] = x;
    }
    // TODO: implement your solution using arr[0..n-1]
    for (int i = 0; i < n; i++) printf("%d%s", arr[i], i + 1 < n ? " " : "\n");
    if (n == 0) printf("\n");
    free(arr);
    return 0;
}
