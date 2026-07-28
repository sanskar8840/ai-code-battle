import sys

def solve():
    data = sys.stdin.read().split()
    idx = 0
    n, m = int(data[idx]), int(data[idx + 1]); idx += 2
    edges = []
    for _ in range(m):
        u, v = int(data[idx]), int(data[idx + 1]); idx += 2
        edges.append((u, v))

    # TODO: implement your solution using n, m, and edges
    print("false")

if __name__ == "__main__":
    solve()
