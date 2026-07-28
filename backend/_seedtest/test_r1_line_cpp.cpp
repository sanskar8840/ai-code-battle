#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> arr;
    int x;
    while (cin >> x) arr.push_back(x);
    // TODO: implement your solution using arr
    for (size_t i = 0; i < arr.size(); i++) cout << arr[i] << (i + 1 < arr.size() ? " " : "");
    cout << endl;
    return 0;
}
