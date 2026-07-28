import sys

def solve():
    data = sys.stdin.read().split()
    idx = 0
    r, c = int(data[idx]), int(data[idx + 1]); idx += 2
    grid = []
    for _ in range(r):
        row = [int(data[idx + j]) for j in range(c)]
        idx += c
        grid.append(row)

    # TODO: implement your solution using grid
    print(0)

if __name__ == "__main__":
    solve()
