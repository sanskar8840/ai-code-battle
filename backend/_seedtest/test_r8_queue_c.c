#include <stdio.h>
#include <string.h>

int main() {
    int q;
    scanf("%d", &q);
    getchar();
    // TODO: maintain a queue; for each "pop"/"peek" op, print the result on its own line.
    for (int i = 0; i < q; i++) {
        char line[256];
        fgets(line, sizeof(line), stdin);
        // parse line: "push x" | "pop" | "peek"
    }
    return 0;
}
