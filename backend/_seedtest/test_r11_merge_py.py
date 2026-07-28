import sys

def solve():
    data = sys.stdin.read().split()
    idx = 0
    k = int(data[idx]); idx += 1
    lists = []
    for _ in range(k):
        size = int(data[idx]); idx += 1
        lists.append([int(x) for x in data[idx:idx + size]])
        idx += size

    # TODO: merge lists, print merged values on one line.
    print()

if __name__ == "__main__":
    solve()
