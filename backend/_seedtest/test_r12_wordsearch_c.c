#include <stdio.h>

int main() {
    int r, c;
    scanf("%d %d", &r, &c);
    char grid[100][101];
    for (int i = 0; i < r; i++) scanf("%s", grid[i]);
    char word[101];
    scanf("%s", word);

    // TODO: implement your solution using grid[0..r-1] and word
    printf("false\n");
    return 0;
}
