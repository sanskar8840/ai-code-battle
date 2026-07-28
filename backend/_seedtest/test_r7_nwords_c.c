#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    getchar();
    char words[1000][1001];
    for (int i = 0; i < n; i++) {
        fgets(words[i], 1001, stdin);
        int len = 0;
        while (words[i][len] && words[i][len] != '\n') len++;
        words[i][len] = '\0';
    }
    // TODO: implement your solution using words[0..n-1]
    printf("0\n");
    return 0;
}
