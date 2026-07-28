#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    char line[65536];
    int cap = 16, n = 0;
    int *arr = malloc(cap * sizeof(int));

    fgets(line, sizeof(line), stdin);
    char *tok = strtok(line, " \t\n");
    while (tok) {
        if (n >= cap) { cap *= 2; arr = realloc(arr, cap * sizeof(int)); }
        arr[n++] = atoi(tok);
        tok = strtok(NULL, " \t\n");
    }

    int target;
    scanf("%d", &target);

    // TODO: implement your solution using arr[0..n-1] and target
    printf("0\n");
    free(arr);
    return 0;
}
