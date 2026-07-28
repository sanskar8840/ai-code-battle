#include <stdio.h>
#include <stdlib.h>

int main() {
    int r, c;
    scanf("%d %d", &r, &c);
    int **grid = malloc(r * sizeof(int *));
    for (int i = 0; i < r; i++) {
        grid[i] = malloc(c * sizeof(int));
        for (int j = 0; j < c; j++) scanf("%d", &grid[i][j]);
    }
    // TODO: implement your solution using grid[0..r-1][0..c-1]
    printf("0\n");
    for (int i = 0; i < r; i++) free(grid[i]);
    free(grid);
    return 0;
}
