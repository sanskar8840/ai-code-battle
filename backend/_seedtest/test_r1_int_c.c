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
    printf("0\n");
    free(arr);
    return 0;
}
