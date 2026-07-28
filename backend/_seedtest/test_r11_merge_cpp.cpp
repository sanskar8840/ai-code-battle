#include <bits/stdc++.h>
using namespace std;

int main() {
    int k;
    cin >> k;
    vector<vector<int>> lists(k);
    for (int i = 0; i < k; i++) {
        int size;
        cin >> size;
        lists[i].resize(size);
        for (int j = 0; j < size; j++) cin >> lists[i][j];
    }
    // TODO: merge lists, print merged values on one line.
    cout << endl;
    return 0;
}
