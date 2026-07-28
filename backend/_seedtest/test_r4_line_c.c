#include <stdio.h>
#include <string.h>

int main() {
    char line[100001];
    if (fgets(line, sizeof(line), stdin) == NULL) line[0] = '\0';
    line[strcspn(line, "\n")] = '\0';
    // Tokens are level-order tree values separated by spaces; "null" = no node.
    // TODO: build the tree from these tokens and implement your solution.
    printf("%s\n", line);
    return 0;
}
